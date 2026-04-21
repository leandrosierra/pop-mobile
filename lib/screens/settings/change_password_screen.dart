import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:pop/constants.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:pop/service/pop_service.dart';
import 'package:pop/service_locator.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class ChangePasswordScreen extends StatelessWidget {
  final _formPwdInputKey = GlobalKey<FormFieldState>();
  final _formPwdConfirmInputKey = GlobalKey<FormFieldState>();
  final TextEditingController passwordTextController = TextEditingController();
  final TextEditingController passwordConfirmTextController =
      TextEditingController();
  final PopService _popService = locator<PopService>();

  ChangePasswordScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
          child: Column(
        children: [
          titleBar(context),
          passwordUpdateForm(context),
        ],
      )),
    );
  }

  passwordUpdateForm(context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 20.0, horizontal: 15.0),
      child: Form(
          child: Column(
        children: [
          passwordField(context),
          passwordConfirmField(context),
          submitButton(context)
        ],
      )),
    );
  }

  passwordField(context) {
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
              hintText: AppLocalizations.of(context).password, //'MOT DE PASSE',
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

  passwordConfirmField(context) {
    return SizedBox(
        width: 550.w,
        height: 120.h,
        child: TextFormField(
          controller: passwordConfirmTextController,
          onChanged: (val) => _formPwdConfirmInputKey.currentState!.validate(),
          key: _formPwdConfirmInputKey,
          keyboardType: TextInputType.text,
          validator: (value) {
            if (value == null || value.isEmpty) {
              return AppLocalizations.of(context)
                  .enterYourPassword; //'Please enter your password';
            } else if (value != passwordTextController.text) {
              return AppLocalizations.of(context)
                  .passwordMismatching; //'Entered password are mismatching';
            }
            return null;
          },
          obscureText: true,
          enableSuggestions: false,
          autocorrect: false,
          decoration: InputDecoration(
              filled: true,
              fillColor: Colors.white,
              hintText: AppLocalizations.of(context).password, //'MOT DE PASSE',
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

  submitButton(context) {
    return ElevatedButton(
        style: ElevatedButton.styleFrom(
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30.h)),
            backgroundColor: Colors.white),
        onPressed: () => _changePassword(context),
        child: SizedBox(
            width: 500.w,
            height: 80.h,
            child: Center(
                child: Text(
              AppLocalizations.of(context).resetPassword, // "Reset password",
              textAlign: TextAlign.center,
              style:
                  GoogleFonts.bebasNeue(color: primarycolor, fontSize: 40.sp),
            ))));
  }

  titleBar(context) {
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

  _changePassword(context) {
    EasyLoading.show(
        status: AppLocalizations.of(context).pleaseWaitProcessingRequest);
    _popService.changePassword(passwordTextController.text).then((value) {
      EasyLoading.dismiss();
      passwordConfirmTextController.clear();
      passwordTextController.clear();
      showDialog(
          context: context,
          builder: (BuildContext context) {
            return AlertDialog(
              title: Text(
                AppLocalizations.of(context)
                    .requestSuccess, //'Request successful',
                style:
                    GoogleFonts.bebasNeue(fontSize: 30.sp, color: primarycolor),
              ),
              content: SingleChildScrollView(
                child: ListBody(
                  children: <Widget>[
                    Text(
                      AppLocalizations.of(context)
                          .passwordUpdatedSuccess, //'Your password has been updated successfully.',
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
                    passwordTextController.clear();
                    passwordConfirmTextController.clear();
                    Navigator.of(context).pop();
                  },
                ),
              ],
            );
          });
    }).catchError((err) {
      EasyLoading.dismiss();
      EasyLoading.showError(err.cause);
    });
  }
}
