import 'dart:io';

import 'package:email_validator/email_validator.dart';
import 'package:flutter/material.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:pop/constants.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:pop/service/auth_service.dart';
import 'package:pop/service_locator.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class EmailSignup extends StatefulWidget {
  const EmailSignup({Key? key}) : super(key: key);

  @override
  State<EmailSignup> createState() => _EmailSignupState();
}

class _EmailSignupState extends State<EmailSignup> {
  final _formKey = GlobalKey<FormState>();
  final _formNameInputKey = GlobalKey<FormFieldState>();
  final _formEmailInputKey = GlobalKey<FormFieldState>();
  final _formEmailConfirmInputKey = GlobalKey<FormFieldState>();
  final AuthService _authService = locator<AuthService>();

  final TextEditingController _nameTextController = TextEditingController();
  final TextEditingController _emailTextController = TextEditingController();
  final TextEditingController _emailConfirmTextController =
      TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
          child: SizedBox(
        //padding: const EdgeInsets.only(left: 35, right: 35),
        width: double.infinity,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            titleBar(),
            SizedBox(height: 70.h),
            Text(
                AppLocalizations.of(context)
                    .forgotPassword, //'Forgot password',
                style: GoogleFonts.bebasNeue(
                  color: primarycolor,
                  fontSize: 60.sp,
                )),
            SizedBox(height: 20.h),
            signupForm()
          ],
        ),
      )),
    );
  }

  signupForm() {
    return Form(
        key: _formKey,
        child: Column(
          children: [
            nameField(),
            SizedBox(height: 20.h),
            emailField(),
            SizedBox(height: 20.sp),
            emailConfirmField(),
            SizedBox(height: 10.sp),
            submitButton()
          ],
        ));
  }

  nameField() {
    return SizedBox(
        width: 550.w,
        height: 120.h,
        child: TextFormField(
          key: _formNameInputKey,
          controller: _nameTextController,
          keyboardType: TextInputType.text,
          validator: (value) {
            var reg = RegExp(r"^[\p{L}\p{N} ]+$", unicode: true);
            if (value == null || value.isEmpty) {
              return AppLocalizations.of(context).pleaseEnterName;
            } else if (value.length < 3 || value.length > 16) {
              return AppLocalizations.of(context).nameShouldBeOfLength;
            } else if (!reg.hasMatch(value)) {
              return AppLocalizations.of(context).noSpecialCharacter;
            }
            return null;
          },
          onChanged: (val) => _formNameInputKey.currentState!.validate(),
          decoration: InputDecoration(
              filled: true,
              fillColor: Colors.white,
              hintText: AppLocalizations.of(context).yourName,
              hintStyle: GoogleFonts.bebasNeue(color: primarycolor),
              contentPadding:
                  EdgeInsets.symmetric(vertical: 25.h, horizontal: 15.w),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(5.0),
              )),
        ));
  }

  emailField() {
    return SizedBox(
        width: 550.w,
        height: 120.h,
        child: TextFormField(
          key: _formEmailInputKey,
          controller: _emailTextController,
          keyboardType: TextInputType.emailAddress,
          validator: (value) {
            if (value == null || value.isEmpty) {
              return AppLocalizations.of(context)
                  .enterEmailId; //'Please enter your email id';
            } else if (!EmailValidator.validate(value)) {
              return AppLocalizations.of(context)
                  .enterValidEmailId; //"Enter valid email ID";
            }
            return null;
          },
          onChanged: (val) => _formEmailInputKey.currentState!.validate(),
          decoration: InputDecoration(
              filled: true,
              fillColor: Colors.white,
              hintText: AppLocalizations.of(context).yourEmailAddress,
              hintStyle: GoogleFonts.bebasNeue(color: primarycolor),
              contentPadding:
                  EdgeInsets.symmetric(vertical: 25.h, horizontal: 15.w),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(5.0),
              )),
        ));
  }

  emailConfirmField() {
    return SizedBox(
        width: 550.w,
        height: 120.h,
        child: TextFormField(
          key: _formEmailConfirmInputKey,
          controller: _emailConfirmTextController,
          keyboardType: TextInputType.emailAddress,
          validator: (value) {
            if (value == null || value.isEmpty) {
              return AppLocalizations.of(context)
                  .enterEmailId; //'Please enter your email id';
            } else if (!EmailValidator.validate(value)) {
              return AppLocalizations.of(context)
                  .enterValidEmailId; //"Enter valid email ID";
            } else if (_emailTextController.text != value) {
              return AppLocalizations.of(context)
                  .emailIdMistaching; //"Email ID provided is mismatching.";
            }
            return null;
          },
          onChanged: (val) =>
              _formEmailConfirmInputKey.currentState!.validate(),
          decoration: InputDecoration(
              filled: true,
              fillColor: Colors.white,
              hintText: AppLocalizations.of(context)
                  .confirmEmailId, //'confirmez VOTRE ADRESSE EMAIL',
              hintStyle: GoogleFonts.bebasNeue(color: primarycolor),
              contentPadding:
                  EdgeInsets.symmetric(vertical: 25.h, horizontal: 15.w),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(5.0),
              )),
        ));
  }

  submitButton() {
    return ElevatedButton(
        style: ElevatedButton.styleFrom(
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30.h)),
            backgroundColor: Colors.white),
        onPressed: createAccount,
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

  createAccount() {
    if (_formKey.currentState!.validate()) {
      EasyLoading.show(
          status: AppLocalizations.of(context)
              .pleaseWaitCreatingAccount); //'Please wait. creating account..');
      _authService
          .createEmailAccount(
              _nameTextController.text, _emailTextController.text)
          .then((value) {
        EasyLoading.dismiss();
        showDialog(
          context: context,
          builder: (BuildContext context) {
            return AlertDialog(
              title: Text(
                AppLocalizations.of(context).accountCreatedSuccessTitle,
                style:
                    GoogleFonts.bebasNeue(fontSize: 30.sp, color: primarycolor),
              ),
              content: SingleChildScrollView(
                child: ListBody(
                  children: <Widget>[
                    Text(
                      AppLocalizations.of(context).accountCreatedSuccessBody,
                      style: GoogleFonts.bebasNeue(
                          fontSize: 20.sp, color: primarycolor),
                    ),
                    Text(
                      AppLocalizations.of(context).youWillReceiveMail,
                      style: GoogleFonts.bebasNeue(
                          fontSize: 20.sp, color: primarycolor),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  child: const Text('Ok'),
                  onPressed: () {
                    _nameTextController.clear();
                    _emailConfirmTextController.clear();
                    _emailTextController.clear();
                    Navigator.of(context).pop();
                  },
                ),
              ],
            );
          },
        ).then((value) => {Navigator.pop(context)});
      }).catchError((err) {
        EasyLoading.dismiss();
        EasyLoading.showError(err.toString());
      });
    }
  }

  titleBar() {
    bool isLandScape =
        MediaQuery.of(context).orientation == Orientation.landscape;

    return Material(
      elevation: 10,
      child: Row(
        mainAxisSize: MainAxisSize.max,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
              onPressed: () => Navigator.pop(context),
              icon: Icon(
                Platform.isIOS ? Icons.arrow_back_ios_new : Icons.arrow_back,
                color: primarycolor,
              )),
          GestureDetector(
            // onTap: () => Get.offAll(const HomePage()),
            child: Text('POP!',
                style: GoogleFonts.bebasNeue(
                    color: primarycolor,
                    fontSize: isLandScape ? 35.sp : 70.sp)),
          ),
          SizedBox(width: 50.w)
        ],
      ),
    );
  }
}
