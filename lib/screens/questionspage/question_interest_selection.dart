import 'package:flutter/material.dart';
import 'package:pop/components/pop_app_animated_icon.dart';
import 'package:pop/components/selection_item.dart';
import 'package:pop/constants.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:pop/model/pop_interest.dart';
import 'package:pop/service/pop_service.dart';
import 'package:pop/service_locator.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class InterestSearch extends StatefulWidget {
  const InterestSearch({Key? key}) : super(key: key);

  @override
  _InterestSearchState createState() => _InterestSearchState();
}

class _InterestSearchState extends State<InterestSearch> {
  late AnimateIconController c1, c2;
  List<PopInterest> interestList = [];
  final PopService _popService = locator<PopService>();
  late Future<List<PopInterest>> _interestListFuture;
  List<PopInterest> selectedInterest = [];

  bool selectAll = false;
  List<String> datas = [];
  @override
  void initState() {
    c1 = AnimateIconController();
    c2 = AnimateIconController();
    _interestListFuture = _popService.getAllPopInterest();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    MediaQueryData queryData = MediaQuery.of(context);
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Container(
            //height: queryData.size.height,
            width: queryData.size.width,
            color: Colors.white,
            child: Column(children: [
              Container(
                  color: primarycolor, width: double.infinity, height: 40.h),
              SizedBox(height: 40.h),
              Image.asset(
                'assets/images/setting_interest.png',
                height: 146.h,
                width: 164.w,
              ),
              SizedBox(height: 70.h),
              Text(AppLocalizations.of(context).selectInterest,
                  style: TextStyle(color: primarycolor, fontSize: 23.sp)),
              SizedBox(height: 30.h),
              suggestionList(),
              SizedBox(height: 50.h),
              okbutton()
            ]),
          ),
        ),
      ),
    );
  }

  suggestionList() {
    return FutureBuilder<List<PopInterest>>(
        future: _interestListFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.done) {
            if (snapshot.hasError) {
              return Center(
                  child:
                      Text(AppLocalizations.of(context).errorFetchinginterest));
            } else if (snapshot.hasData) {
              interestList = snapshot.data ?? [];

              var interestWidgt = interestList
                  .map((e) => SelectionItem(
                        text: e.label,
                        onPress: (val) => onInterestSelection(val, e),
                        initialState: selectedInterest.contains(e),
                      ))
                  .toList();
              interestWidgt.insert(0, selectAllButton());
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.start,
                children: interestWidgt,
              );
            }
          }
          return Center(
              child: Text(AppLocalizations.of(context).fetchingInterestList));
        });
  }

  SelectionItem selectAllButton() => SelectionItem(
        text: AppLocalizations.of(context).selectAll, //'Tout selectionner',
        initialState: selectAll,
        onPress: (value) {
          setState(() {
            selectAll = value;
            (selectAll)
                ? selectedInterest.addAll(interestList)
                : selectedInterest.clear();
          });
        },
      );

  okbutton() {
    return MaterialButton(
      onPressed: () => Navigator.pop(context, selectedInterest),
      color: primarycolor,
      child: const Text('OK', style: TextStyle(color: Colors.white)),
      padding: const EdgeInsets.all(16),
      shape: const CircleBorder(),
    );
  }

  onInterestSelection(bool selected, PopInterest interest) {
    if (selected) {
      selectedInterest.add(interest);
    } else {
      selectedInterest.remove(interest);
    }
    setState(() {
      selectedInterest = selectedInterest;
    });
  }
}
