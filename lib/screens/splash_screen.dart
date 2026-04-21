import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/route_manager.dart';
import 'package:pop/constants.dart';
import 'package:pop/screens/homepage/home.dart';
import 'package:pop/screens/setup/geography_selection.dart';
import 'package:pop/screens/setup/interest_selection.dart';
import 'package:pop/screens/signup/signup.dart';
import 'package:pop/service/auth_service.dart';
import 'package:pop/service_locator.dart';

class SplashScreen extends StatelessWidget {
  static const splashScreenImage = 'assets/images/Logo.png';
  final AuthService _authService = locator<AuthService>();

  SplashScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    navigateUserBasedOnState(context);
    double width = MediaQuery.of(context).size.width;
    return Scaffold(
      backgroundColor: primarycolor,
      body: getSplashScreen(width, context),
    );
  }

  navigateUserBasedOnState(context) async {
    _authService.getCurrentSignedInUser().then((value) async {
      if (value == null) {
        Get.off(const SignupScreen());
      } else {
        if (value.userChoiceGeo.isEmpty) {
          Get.off(const GeographySelection());
        } else if (value.userInterest.isEmpty) {
          Get.off(const InterestSelection());
        } else {
          Get.off(const HomePage());
        }
      }
    }).catchError((e) {
      var snackBar = SnackBar(content: Text(e.toString()));
      ScaffoldMessenger.of(context).showSnackBar(snackBar);
      //throw e;
      _authService.signout();
      Get.off(const SignupScreen());
    });
  }

  getSplashScreen(double width, context) {
    return SizedBox(
      width: double.infinity,
      child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisSize: MainAxisSize.max,
          children: <Widget>[
            Image.asset(
              splashScreenImage,
              height: 356.h,
              width: 396.w,
            ),
            SizedBox(height: 60.h),
            const CircularProgressIndicator(),
          ]),
    );
  }
}
