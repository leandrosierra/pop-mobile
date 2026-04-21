import 'dart:async';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:pop/constants.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:pop/model/pop_location.dart';
import 'package:pop/screens/setup/search_item.dart';
import 'package:pop/service/pop_service.dart';
import 'package:pop/service_locator.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class GeoLocationSearch extends StatefulWidget {
  final List<PopLocation> exclutionList;

  const GeoLocationSearch({Key? key, this.exclutionList = const []})
      : super(key: key);

  @override
  _GeoLocationSearchState createState() => _GeoLocationSearchState();
}

class _GeoLocationSearchState extends State<GeoLocationSearch> {
  late AnimationController controller;
  String searchTextVal = '';
  List<PopLocation> suggestions = [];
  List<PopLocation> selectedRegions = [];
  final PopService _popService = locator<PopService>();
  Timer? _debounce;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
        child: Column(
      children: [
        Container(color: primarycolor, width: double.infinity, height: 40.h),
        SizedBox(height: 40.h),
        Image.asset(
          'assets/images/SETTINGS GEO.png',
          height: 180.h,
          width: 168.w,
        ),
        SizedBox(height: 50.h),
        Text(AppLocalizations.of(context).chooseGeoAreas,
            textAlign: TextAlign.center,
            style: TextStyle(color: primarycolor, fontSize: 28.sp)),
        // Text("GEOGRAPHIQUES D'INTÉRÊT",
        //     textAlign: TextAlign.center,
        //     style: TextStyle(color: primarycolor, fontSize: 28.sp)),
        SizedBox(height: 20.h),
        Text(
          AppLocalizations.of(context).searchCity,
          textAlign: TextAlign.center,
          style: TextStyle(color: primarycolor, fontSize: 23.sp),
        ),
        // Text(
        //   'vos villes, département, cantons, régions, pays',
        //   textAlign: TextAlign.center,
        //   style: TextStyle(color: primarycolor, fontSize: 23.sp),
        // ),
        SizedBox(height: 30.h),
        searchBox(),
      ],
    ));
  }

  searchBox() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        searchTextBox(),
        selectedRegions.isEmpty ? SizedBox(height: 80.h) : selectedRegionBox(),
        (searchTextVal.length >= 3 && suggestions.isEmpty)
            ? noResultBox()
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                    // selectedLocation(),
                    searchSuggestionBox(),
                  ]),
        SizedBox(height: 40.h),
        okbutton()
      ],
    );
  }

  SizedBox noResultBox() {
    return SizedBox(
        height: 225.h,
        width: 330.w,
        child: Center(
            child: Text(
                '${AppLocalizations.of(context).noLocationFor} $searchTextVal')));
  }

  selectedLocation() {
    return selectedRegions.isEmpty
        ? SizedBox(width: 330.w, height: 225.h)
        : Container(
            padding: EdgeInsets.symmetric(horizontal: 35.w),
            height: 225.h,
            width: 330.w,
            child: ListView.builder(
                itemCount: selectedRegions.length,
                itemBuilder: (BuildContext context, int index) {
                  return Text(selectedRegions[index].label);
                }),
          );
  }

  searchSuggestionBox() {
    return suggestions.isEmpty
        ? SizedBox(height: 225.h, width: 330.w)
        : SizedBox(
            height: 225.h,
            width: 450.w,
            child: ListView.builder(
                itemCount: suggestions.length,
                itemBuilder: (BuildContext context, int index) {
                  var isPresent = selectedRegions.contains(suggestions[index]);
                  return suggestionItem(suggestions[index], isPresent);
                }),
          );
  }

  searchTextBox() {
    bool isLandScape =
        MediaQuery.of(context).orientation == Orientation.landscape;
    return SizedBox(
      width: 550.w,
      height: 50.h,
      child: TextField(
        keyboardType: TextInputType.text,
        decoration: InputDecoration(
            isDense: true,
            // hintText: '',
            contentPadding:
                EdgeInsets.symmetric(vertical: 10.h, horizontal: 0.w),
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

  searchTextOnChange(String value) async {
    if (_debounce?.isActive ?? false) _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () async {
      List<PopLocation> result = [];
      if (value.length >= 2) {
        result = await _popService.searchReferential(value, 0);
      }
      setState(() {
        searchTextVal = value;
        suggestions =
            result.where((geo) => !widget.exclutionList.contains(geo)).toList();
      });
    });
  }

  okbutton() {
    return MaterialButton(
      height: 90.h,
      onPressed: () {
        Navigator.pop(context, selectedRegions);
      },
      color: primarycolor,
      padding: const EdgeInsets.all(16),
      shape: const CircleBorder(),
      child: const Text('OK', style: TextStyle(color: Colors.white)),
    );
  }

  suggestionItem(PopLocation popLocation, isSelected) {
    var popLocationType = popLocation.locationType;
    popLocation.label = popLocationType == LocationType.country
        ? popLocation.label.toUpperCase()
        : popLocation.label;
    return SearchItem(
      text: SizedBox(
        width: 350.w,
        child: Text(isSelected ? popLocation.label + '✅' : popLocation.label,
            overflow: TextOverflow.ellipsis,
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

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }

  selectedRegionBox() {
    List<Text> widgets = selectedRegions
        .map(
            (e) => Text(e.label, style: GoogleFonts.bebasNeue(fontSize: 25.sp)))
        .toList();
    return selectedRegions.isEmpty
        ? SizedBox(height: 0.h, width: 330.w)
        : SizedBox(
            // height: 225.h,
            width: 400.w,
            child: Column(
              children: widgets,
            ),
          );
  }
}
