import 'package:flutter/material.dart';
import 'package:pop/constants.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:pop/model/pop_location.dart';
import 'package:pop/screens/setup/search_with_suggestion.dart';
import 'package:pop/service/pop_service.dart';
import 'package:pop/service_locator.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class GeographySelection extends StatefulWidget {
  const GeographySelection({Key? key}) : super(key: key);

  @override
  _GeographySelectionState createState() => _GeographySelectionState();
}

class _GeographySelectionState extends State<GeographySelection> {
  var popService = locator<PopService>();

  @override
  Widget build(BuildContext context) {
    MediaQueryData queryData = MediaQuery.of(context);

    return Scaffold(
      body: SingleChildScrollView(
        child: SafeArea(
          child: Container(
            height: queryData.size.height,
            width: queryData.size.width,
            color: Colors.white,
            child: Column(children: [
              Container(
                  color: primarycolor, width: double.infinity, height: 40.h),
              SizedBox(height: 40.h),
              Image.asset(
                'assets/images/SETTINGS GEO.png',
                height: 180.h,
                width: 168.w,
              ),
              SizedBox(height: 50.h),
              Text(
                AppLocalizations.of(context).searchAndSelectLocations,
                style: TextStyle(color: primarycolor, fontSize: 23.sp),
              ),
              SizedBox(height: 30.h),
              SearchWithSuggestion(searchResultFactory: geoGraphySearchFactory),
            ]),
          ),
        ),
      ),
      //resizeToAvoidBottomInset: false,
    );
  }

  Future<List<PopLocation>> geoGraphySearchFactory(value) {
    var refs = popService.searchReferential(value, 0);
    return refs;
  }
}
