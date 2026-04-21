import 'package:email_validator/email_validator.dart';
import 'package:flutter/material.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/route_manager.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:pop/constants.dart';
import 'package:pop/screens/homepage/home.dart';
import 'package:pop/screens/setup/geography_selection.dart';
import 'package:pop/screens/setup/interest_selection.dart';
import 'package:pop/screens/signup/email_signup.dart';
import 'package:pop/screens/signup/forgot_password_page.dart';
import 'package:pop/service/auth_service.dart';
import 'package:pop/service_locator.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class EmailLoginForm extends StatefulWidget {
  const EmailLoginForm({Key? key}) : super(key: key);

  @override
  State<EmailLoginForm> createState() => _EmailLoginFormState();
}

class _EmailLoginFormState extends State<EmailLoginForm> {
  final _formKey = GlobalKey<FormState>();
  final _formEmailInputKey = GlobalKey<FormFieldState>();
  final _formPwdInputKey = GlobalKey<FormFieldState>();

  TextEditingController emailTextController = TextEditingController();
  TextEditingController passwordTextController = TextEditingController();

  final AuthService _authService = locator<AuthService>();

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          emailField(),
          SizedBox(height: 10.h),
          passwordField(),
          SizedBox(height: 15.h),
          loginButton(),
          SizedBox(height: 15.h),
          forgotPasswordLink(),
          SizedBox(height: 20.h),
          createAccountButton(),
        ],
      ),
    );
  }

  emailField() {
    return SizedBox(
        width: 550.w,
        height: 120.h,
        child: TextFormField(
          key: _formEmailInputKey,
          controller: emailTextController,
          keyboardType: TextInputType.emailAddress,
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Please enter your email id';
            } else if (!EmailValidator.validate(value)) {
              return "Enter valid email ID";
            }
            return null;
          },
          onChanged: (val) => _formEmailInputKey.currentState!.validate(),
          decoration: InputDecoration(
              filled: true,
              fillColor: Colors.white,
              hintText: 'VOTRE ADRESSE EMAIL',
              hintStyle: GoogleFonts.bebasNeue(color: primarycolor),
              contentPadding:
                  EdgeInsets.symmetric(vertical: 25.h, horizontal: 15.w),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(5.0),
              )),
        ));
  }

  passwordField() {
    return SizedBox(
        width: 550.w,
        height: 120.h,
        child: TextFormField(
          controller: passwordTextController,
          onChanged: (val) => _formPwdInputKey.currentState!.validate(),
          key: _formPwdInputKey,
          keyboardType: TextInputType.text,
          validator: (value) {
            if (value == null || value.isEmpty) {
              return AppLocalizations.of(context)
                  .enterYourPassword; //'Please enter your password';
            }
            return null;
          },
          obscureText: true,
          enableSuggestions: false,
          autocorrect: false,
          decoration: InputDecoration(
              filled: true,
              fillColor: Colors.white,
              hintText: 'MOT DE PASSE',
              hintStyle: GoogleFonts.bebasNeue(color: primarycolor),
              contentPadding:
                  EdgeInsets.symmetric(vertical: 20.h, horizontal: 15.w),
              focusedBorder: OutlineInputBorder(
                borderSide: BorderSide(color: primarycolor, width: 2.w),
              ),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(5.0),
              )),
        ));
  }

  loginButton() {
    return ElevatedButton(
        style: ElevatedButton.styleFrom(
            shape: const CircleBorder(), backgroundColor: Colors.white),
        onPressed: () {
          if (_formKey.currentState!.validate()) {
            EasyLoading.show(
                status: AppLocalizations.of(context).pleaseWaitLoginInprogress);
            _authService
                .signinWithEmail(
                    emailTextController.text, passwordTextController.text)
                .then((value) {
              EasyLoading.dismiss();
              if (value == null) {
                EasyLoading.showError(AppLocalizations.of(context)
                    .unableToLoginPleaseCheck); // "Unable to signin. please check your credentials.");
              } else if (value.userChoiceGeo.isEmpty) {
                Get.off(const GeographySelection());
              } else if (value.userInterest.isEmpty) {
                Get.off(const InterestSelection());
              } else {
                Get.off(const HomePage());
              }
            }).catchError((err) {
              EasyLoading.dismiss();
              EasyLoading.showError(err.cause);
            });
          }
        },
        child: SizedBox(
            width: 100.w,
            height: 100.h,
            child: Center(
                child: Text(
              "Ok",
              style:
                  GoogleFonts.bebasNeue(color: primarycolor, fontSize: 65.sp),
            ))));
  }

  createAccountButton() {
    return ElevatedButton(
        style: ElevatedButton.styleFrom(
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30.h)),
            backgroundColor: Colors.white),
        onPressed: () => Get.to(const EmailSignup()),
        child: SizedBox(
            width: 350.w,
            height: 80.h,
            child: Center(
                child: Text(
              AppLocalizations.of(context).createAccount, //"Créer un compte",
              style:
                  GoogleFonts.bebasNeue(color: primarycolor, fontSize: 50.sp),
            ))));
  }

  forgotPasswordLink() {
    return TextButton(
      onPressed: () => Get.to(ForgotPasswordPage()),
      style: TextButton.styleFrom(
        padding: EdgeInsets.zero,
        minimumSize: Size.zero,
        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
      ),
      child: Text(
        AppLocalizations.of(context).forgotPassword, //'Forgot password',
        style: GoogleFonts.bebasNeue(fontSize: 35.sp, color: Colors.white),
      ),
    );
  }
}
