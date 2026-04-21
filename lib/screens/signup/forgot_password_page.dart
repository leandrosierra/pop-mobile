import 'dart:io';

import 'package:email_validator/email_validator.dart';
import 'package:flutter/material.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:pop/constants.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:pop/service/auth_service.dart';
import 'package:pop/service_locator.dart';

class ForgotPasswordPage extends StatelessWidget {
  ForgotPasswordPage({Key? key}) : super(key: key);
  final _emailInputKey = GlobalKey<FormFieldState>();
  final TextEditingController _emailTextController = TextEditingController();
  final AuthService _authService = locator<AuthService>();

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
            titleBar(context),
            SizedBox(height: 70.h),
            Text('Create new Account',
                style: GoogleFonts.bebasNeue(
                  color: primarycolor,
                  fontSize: 60.sp,
                )),
            SizedBox(height: 20.h),
            forgotPasswordForm(context)
          ],
        ),
      )),
    );
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
          Text('POP!',
              style: GoogleFonts.bebasNeue(
                  color: primarycolor, fontSize: isLandScape ? 35.sp : 70.sp)),
          SizedBox(width: 50.w)
        ],
      ),
    );
  }

  forgotPasswordForm(context) {
    return Column(
      children: [emailField(), submitButton(context)],
    );
  }

  emailField() {
    return SizedBox(
        width: 550.w,
        height: 120.h,
        child: TextFormField(
          key: _emailInputKey,
          controller: _emailTextController,
          keyboardType: TextInputType.emailAddress,
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Please enter your email id';
            } else if (!EmailValidator.validate(value)) {
              return "Enter valid email ID";
            }
            return null;
          },
          onChanged: (val) => _emailInputKey.currentState!.validate(),
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

  submitButton(context) {
    return ElevatedButton(
        style: ElevatedButton.styleFrom(
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30.h)),
            backgroundColor: Colors.white),
        onPressed: () {
          EasyLoading.show(status: 'Please wait. Processing your request...');
          _authService
              .forgotPasswordRequest(_emailTextController.text)
              .then((value) {
            EasyLoading.dismiss();
            showDialog(
                context: context,
                builder: (BuildContext context) {
                  return AlertDialog(
                    title: Text(
                      'Request successful',
                      style: GoogleFonts.bebasNeue(
                          fontSize: 30.sp, color: primarycolor),
                    ),
                    content: SingleChildScrollView(
                      child: ListBody(
                        children: <Widget>[
                          Text(
                            'We have processed your request',
                            style: GoogleFonts.bebasNeue(
                                fontSize: 20.sp, color: primarycolor),
                          ),
                          Text(
                            'You would have received a mail containing new password to access the account. kindly check your email',
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
                          _emailTextController.clear();
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
        },
        child: SizedBox(
            width: 350.w,
            height: 80.h,
            child: Center(
                child: Text(
              "Reset password",
              style:
                  GoogleFonts.bebasNeue(color: primarycolor, fontSize: 50.sp),
            ))));
  }
}
