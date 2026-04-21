import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/route_manager.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:pop/constants.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:pop/exception/pop_service_exception.dart';
import 'package:pop/exception/user_authentication_exception.dart';
import 'package:pop/model/pop_app_user.dart';
import 'package:pop/screens/homepage/home.dart';
import 'package:pop/screens/setup/geography_selection.dart';
import 'package:pop/screens/setup/interest_selection.dart';
import 'package:pop/screens/signup/email_login_form.dart';
import 'package:pop/service/auth_service.dart';
import 'package:pop/service/impl/social_auth_service.dart';
import 'package:pop/service_locator.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({Key? key}) : super(key: key);

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final AuthService _authService = locator<AuthService>();

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: SafeArea(
        child: SingleChildScrollView(
          reverse: true,
          child: Container(
            padding: EdgeInsets.only(top: 35, bottom: 20.h),
            width: double.infinity,
            color: primarycolor,
            child: Column(
              mainAxisSize: MainAxisSize.max,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Image.asset(
                  'assets/images/Logo.png',
                  height: 220.h,
                  width: 270.w,
                ),
                SizedBox(height: 10.h),
                RichText(
                    textAlign: TextAlign.center,
                    text: const TextSpan(
                        style: TextStyle(height: 1.2),
                        children: <TextSpan>[
                          TextSpan(
                            text: 'Bienvenue!\n',
                          ),
                          TextSpan(
                              text:
                                  'Proposez la politique que vous souhaitez en\n'),
                          TextSpan(text: 'votant et lançant vos réferundum.\n'),
                        ])),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    iconButton('assets/icons/google_signin.svg',
                        () => {signIn(context, AuthProvider.google)}),
                    SizedBox(width: 40.w),
                    iconButton('assets/icons/facebook.svg',
                        () => {signIn(context, AuthProvider.facebook)}),
                    SizedBox(width: 40.w),
                    (Platform.isIOS)
                        ? iconButton('assets/icons/apple_icon.svg',
                            () => {signIn(context, AuthProvider.apple)})
                        : Container(),
                    // SizedBox(width: 20.w),
                    // iconButton('assets/icons/insta_icon.svg', () async => {}),
                  ],
                ),
                SizedBox(height: 10.h),
                Text('OU',
                    style: GoogleFonts.bebasNeue(
                        fontSize: 50.sp, color: Colors.white)),
                Text('Déjà inscrit, connectez vous',
                    style: GoogleFonts.bebasNeue(
                        fontSize: 50.sp, color: Colors.white)),
                SizedBox(height: 10.h),
                const EmailLoginForm(),
                //Expanded(flex: 2, child: Container(height: 10.h)),
                Container(height: 80.h),
                Padding(
                    padding: EdgeInsets.only(
                        bottom: MediaQuery.of(context).viewInsets.bottom))
              ],
            ),
          ),
        ),
      ),
    );
  }

  iconButton(url, action) {
    return GestureDetector(
      onTap: action,
      child: SizedBox(
        height: 100.h,
        width: 100.w,
        child: SvgPicture.asset(url),
      ),
    );
  }

  Future<void> signIn(context, AuthProvider authProvider) async {
    EasyLoading.show(status: AppLocalizations.of(context).pleaseWaitSigningIn);
    try {
      PopAppUser? user = await _authService.signInUser(
          context: context, provider: authProvider);
      EasyLoading.dismiss();
      if (user != null) {
        //Get.off(const GeographySelection());
        navigateUserBasedOnState();
      } else {
        EasyLoading.showError(
            "Impossible de se connecter. Veuillez réessayer plus tard.");
      }
    } on UserAuthenticationException catch (e) {
      EasyLoading.dismiss();
      EasyLoading.showError(e.cause);
    } on PopServiceException catch (e) {
      EasyLoading.dismiss();
      EasyLoading.showError(e.cause);
    } on Exception catch (e) {
      EasyLoading.dismiss();
      EasyLoading.showError(
          "Impossible de se connecter. Veuillez réessayer plus tard.");
    }
  }

  navigateUserBasedOnState() async {
    EasyLoading.show(status: AppLocalizations.of(context).loadingUserProfile);
    _authService.getCurrentSignedInUser().then((value) async {
      EasyLoading.dismiss();
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
      EasyLoading.dismiss();
      EasyLoading.showError(e.cause);
    });
  }
}
