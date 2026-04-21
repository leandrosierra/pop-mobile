import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/route_manager.dart';
import 'package:pop/constants.dart';
import 'package:pop/model/pop_location.dart';
import 'package:pop/screens/setup/interest_selection.dart';
import 'package:pop/screens/setup/search_item.dart';
import 'package:pop/service/pop_service.dart';
import 'package:pop/service_locator.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class SearchWithSuggestion extends StatefulWidget {
  final Future<List<PopLocation>> Function(String val) searchResultFactory;
  const SearchWithSuggestion({Key? key, required this.searchResultFactory})
      : super(key: key);

  @override
  _SearchWithSuggestionState createState() => _SearchWithSuggestionState();
}

class _SearchWithSuggestionState extends State<SearchWithSuggestion>
    with SingleTickerProviderStateMixin {
  late AnimationController controller;
  String searchTextVal = '';
  List<PopLocation> suggestions = [];
  List<PopLocation> selectedRegions = [];
  final PopService _popService = locator<PopService>();

  @override
  void initState() {
    super.initState();
    controller = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 1000));
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        searchTextBox(),
        SizedBox(height: 80.h),
        (searchTextVal.length >= 3 && suggestions.isEmpty)
            ? noResultBox()
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [selectedLocation(), searchSuggestionBox()]),
        SizedBox(height: 40.h),
        okbutton()
      ],
    );
  }

  SizedBox noResultBox() {
    return SizedBox(
        height: 225.h,
        width: 330.w,
        child: Center(child: Text('Pas de localisation pour $searchTextVal')));
  }

  searchTextBox() {
    bool isLandScape =
        MediaQuery.of(context).orientation == Orientation.landscape;
    return SizedBox(
      width: 448.w,
      height: 50.h,
      child: TextField(
        keyboardType: TextInputType.text,
        decoration: InputDecoration(
            isDense: true,
            contentPadding:
                const EdgeInsets.symmetric(vertical: 0, horizontal: 0),
            prefixIcon: Icon(Icons.search, size: isLandScape ? 20.sp : 30.sp),
            focusedBorder: OutlineInputBorder(
              borderSide: BorderSide(color: primarycolor, width: 2.w),
            ),
            prefixIconConstraints: BoxConstraints(minWidth: 40.w),
            border: const OutlineInputBorder()),
        onChanged: searchTextOnChange,
      ),
    );
  }

  selectedLocation() {
    return selectedRegions.isEmpty
        ? Expanded(flex: 5, child: SizedBox(height: 225.h))
        : Expanded(
            flex: 5,
            child: SizedBox(
              height: 225.h,
              child: ListView.builder(
                  itemCount: selectedRegions.length,
                  itemBuilder: (BuildContext context, int index) {
                    return selectionText(selectedRegions[index]);
                  }),
            ),
          );
  }

  searchSuggestionBox() {
    return suggestions.isEmpty
        ? Expanded(flex: 5, child: SizedBox(height: 225.h))
        : Expanded(
            flex: 5,
            child: SizedBox(
              height: 225.h,
              child: ListView.builder(
                  itemCount: suggestions.length,
                  itemBuilder: (BuildContext context, int index) {
                    var isPresent =
                        selectedRegions.contains(suggestions[index]);
                    return suggestionItem(suggestions[index], isPresent);
                  }),
            ),
          );
  }

  selectionText(PopLocation location) {
    var popLocationType = location.locationType;
    return Text(
        (popLocationType == LocationType.country)
            ? location.label.toUpperCase()
            : location.label,
        style: TextStyle(
            fontSize: 26.sp,
            fontWeight: (popLocationType == LocationType.department)
                ? FontWeight.bold
                : FontWeight.normal));
  }

  suggestionItem(PopLocation popLocation, isSelected) {
    var popLocationType = popLocation.locationType;
    return SearchItem(
      text: Flexible(
        child: Text(
            (popLocationType == LocationType.country)
                ? popLocation.label.toUpperCase()
                : popLocation.label,
            style: TextStyle(
                fontSize: 26.sp,
                fontWeight: (popLocationType == LocationType.department)
                    ? FontWeight.bold
                    : FontWeight.normal)),
      ),
      initialState: isSelected,
      onPress: (state) {
        (state)
            ? selectedRegions.add(popLocation)
            : removeSelection(popLocation);
        setState(() => selectedRegions = selectedRegions);
      },
    );
  }

  removeSelection(PopLocation poplocation) {
    selectedRegions.removeWhere((element) =>
        element.id == poplocation.id && element.label == poplocation.label);
  }

  searchTextOnChange(String value) async {
    List<PopLocation> result = [];
    if (value.length >= 2) {
      result = await widget.searchResultFactory.call(value);
    }
    setState(() {
      searchTextVal = value;
      suggestions = result;
    });
  }

  okbutton() {
    return MaterialButton(
      height: 90.h,
      onPressed: saveGeoLocationForUser,
      color: primarycolor,
      padding: const EdgeInsets.all(16),
      shape: const CircleBorder(),
      child: const Text('OK', style: TextStyle(color: Colors.white)),
    );
  }

  saveGeoLocationForUser() {
    if (selectedRegions.isEmpty) {
      var snackBar = SnackBar(
          content: Text(AppLocalizations.of(context).pleaseChooseOneLocation));
      ScaffoldMessenger.of(context).showSnackBar(snackBar);
    } else {
      _popService.saveGeoLocation(selectedRegions).then((value) {
        Get.to(const InterestSelection());
      }).catchError((error) {
        var snackBar = SnackBar(
            content: Text(AppLocalizations.of(context).unableToSaveLocation));
        ScaffoldMessenger.of(context).showSnackBar(snackBar);
      });
    }
  }
}
