import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_linkify/flutter_linkify.dart';
import 'package:get/route_manager.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:pop/components/flex_title_bar.dart';
import 'package:pop/constants.dart';
import 'package:pop/model/pop_question.dart';
import 'package:pop/screens/questionspage/new_question_page.dart';
import 'package:pop/screens/settings/setting_page.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:pop/util.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class QuestionExplanationPage extends StatelessWidget {
  final PopQuestion popQuestion;
  final Color cardColor;
  const QuestionExplanationPage(
      {Key? key, required this.popQuestion, required this.cardColor})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.max,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Container(
          decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: primarycolor))),
          child: FlexTitleBar(
            leftButtonAction: () {
              Navigator.pop(context);
              Timer(const Duration(milliseconds: 300), () {
                Get.to(const SettingPage());
              });
            },
            rightButtonAction: () {
              Navigator.pop(context);
              Timer(const Duration(milliseconds: 300), () {
                Get.to(const NewQuestionPage());
              });
            },
          ),
        ),
        SizedBox(height: 30.h),
        Text(popQuestion.questionTitle,
            textAlign: TextAlign.center,
            style: GoogleFonts.bebasNeue(
              color: cardColor,
              fontSize: 54.sp,
            )),
        SizedBox(height: 30.h),
        SizedBox(
          width: 600.w,
          child: Linkify(
            onOpen: (link) async {
              final Uri url = Uri.parse(link.url);
              if (await canLaunchUrl(url)) {
                await launchUrl(url);
              } else {
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                  content: Text(AppLocalizations.of(context).unableToOpenLink),
                ));
              }
            },
            text: popQuestion.questionDesc.capitalize(),
            textAlign: TextAlign.left,
            style: GoogleFonts.roboto(color: Colors.black),
          ),
        ),
        SizedBox(height: 50.h),
        MaterialButton(
          color: primarycolor,
          padding: const EdgeInsets.all(16),
          shape: const CircleBorder(),
          onPressed: () => Navigator.pop(context),
          child: const Text('OK', style: TextStyle(color: Colors.white)),
        )
      ],
    );
  }
}
