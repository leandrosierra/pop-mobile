import 'dart:async';

import 'package:flutter/material.dart';
import 'package:get/route_manager.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:pop/components/flex_title_bar.dart';
import 'package:pop/constants.dart';
import 'package:pop/model/pop_interest.dart';
import 'package:pop/model/pop_location.dart';
import 'package:pop/model/pop_question.dart';
import 'package:pop/model/pop_question_detail.dart';
import 'package:pop/screens/questionspage/new_question_page.dart';
import 'package:pop/screens/settings/setting_page.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:pop/service/pop_service.dart';
import 'package:pop/service_locator.dart';
import 'package:share_plus/share_plus.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class QuestionStatPage extends StatelessWidget {
  final PopQuestion popQuestion;
  final Color cardColor;

  final PopService _popService = locator<PopService>();
  late BuildContext _context;

  QuestionStatPage(
      {Key? key, required this.popQuestion, required this.cardColor})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    _context = context;
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.max,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              titlebar(context),
              SizedBox(height: 30.h),
              questionText(),
              SizedBox(height: 20.h),
              resultgraph(),
              SizedBox(height: 20.h),
              okbutton(context),
              SizedBox(height: 5.h),
              shareButton(context)
            ],
          ),
        ),
      ),
    );
  }

  resultgraph() {
    return FutureBuilder<PopQuestionDetail>(
        future: _popService.getQuestionStat(popQuestion.id),
        builder: (BuildContext context, AsyncSnapshot<dynamic> snapshot) {
          if (snapshot.connectionState == ConnectionState.done) {
            if (snapshot.hasError) {
              return Center(
                child: Text(
                    AppLocalizations.of(_context).errorFetchingQuestionResult),
              );
            } else if (snapshot.hasData) {
              return barGraph(snapshot.data);
            }
          }
          return SizedBox(
              height: 600.h,
              child: const Center(child: CircularProgressIndicator()));
        });
  }

  MaterialButton okbutton(BuildContext context) {
    return MaterialButton(
      color: primarycolor,
      padding: const EdgeInsets.all(16),
      shape: const CircleBorder(),
      onPressed: () => Navigator.pop(context),
      child: const Text('OK', style: TextStyle(color: Colors.white)),
    );
  }

  questionText() {
    return SizedBox(
      width: 630.w,
      child: Text(popQuestion.questionTitle,
          textAlign: TextAlign.center,
          style: GoogleFonts.bebasNeue(
            color: cardColor,
            fontSize: 54.sp,
          )),
    );
  }

  titlebar(BuildContext context) {
    return Container(
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
    );
  }

  barGraph(PopQuestionDetail data) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        questionTags(data.geoTags),
        questionInterestTags(data.interestTags),
        SizedBox(height: 30.h),
        // Image.asset('assets/images/poll_result.png',
        //     height: 100.h, width: 100.w),
        SizedBox(height: 20.h),
        bars(data.stats),
        blueLine(),
        labels(data.stats),
      ],
    );
  }

  bars(QuestionStats data) {
    var total = (data.yes + data.neutral + data.no);
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        singleBar(total != 0 ? (data.no / total) * 100 : 0),
        SizedBox(width: 120.w),
        singleBar(total != 0 ? (data.neutral / total) * 100 : 0),
        SizedBox(width: 120.w),
        singleBar(total != 0 ? (data.yes / total) * 100 : 0)
      ],
    );
  }

  blueLine() {
    return Container(width: 563.w, height: 3.h, color: primarycolor);
  }

  labels(QuestionStats data) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // SizedBox(width: 10.w),
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(AppLocalizations.of(_context).no,
                style: GoogleFonts.bebasNeue(
                    color: primarycolor, fontSize: 130.sp)),
            Text(data.no.toString(),
                style: GoogleFonts.bebasNeue(color: primarycolor))
          ],
        ),
        SizedBox(width: 40.w),
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(AppLocalizations.of(_context).noOpinion,
                style: GoogleFonts.bebasNeue(
                    color: primarycolor, fontSize: 30.sp)),
            Text(data.neutral.toString(),
                style: GoogleFonts.bebasNeue(color: primarycolor))
          ],
        ),
        SizedBox(width: 25.w),
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(AppLocalizations.of(_context).yes,
                style: GoogleFonts.bebasNeue(
                    color: primarycolor, fontSize: 130.sp)),
            Text(data.yes.toString(),
                style: GoogleFonts.bebasNeue(color: primarycolor))
          ],
        )
      ],
    );
  }

  singleBar(num i) {
    return Column(
      children: [
        Text('${i.round()} %', style: TextStyle(color: cardColor)),
        SizedBox(height: 20.h),
        Container(
          width: 40.w,
          height: (200 * i * 0.01).h,
          color: primarycolor,
        ),
      ],
    );
  }

  questionTags(List<PopLocation> geos) {
    List geoTag = geos.map((e) => e.label).toList();
    return SizedBox(
        width: 550.w,
        child: Text(geoTag.join(" - ").toUpperCase(),
            overflow: TextOverflow.ellipsis));
  }

  questionInterestTags(List<PopInterest> interests) {
    List interestTags = interests.map((e) => e.label).toList();
    return SizedBox(
        width: 550.w,
        child: Text(interestTags.join(" - ").toUpperCase(),
            overflow: TextOverflow.ellipsis));
  }

  shareButton(context) {
    return TextButton.icon(
        onPressed: () => Share.share(
            'Regardes ce que j\'ai trouvé !"${popQuestion.questionTitle}"',
            subject: 'Look what I found!'),
        icon: const Icon(Icons.share, color: primarycolor),
        label: Text(
            AppLocalizations.of(context)
                .shareToFriends, //'partager à des amis',
            style: const TextStyle(color: primarycolor)));
  }
}
