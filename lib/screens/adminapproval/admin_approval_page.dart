import 'package:flutter/material.dart';
import 'package:flutter_linkify/flutter_linkify.dart';
import 'package:get/route_manager.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:pop/components/flex_title_bar.dart';
import 'package:pop/constants.dart';
import 'package:pop/model/pop_interest.dart';
import 'package:pop/model/pop_location.dart';
import 'package:pop/model/pop_question.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:pop/model/pop_question_detail.dart';
import 'package:pop/screens/questionsummary/question_summary_page.dart';
import 'package:pop/screens/settings/setting_page.dart';
import 'package:pop/service/pop_admin_service.dart';
import 'package:pop/service/pop_service.dart';
import 'package:pop/service_locator.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class AdminApprovalPage extends StatefulWidget {
  final PopQuestion popQuestion;

  const AdminApprovalPage({Key? key, required this.popQuestion})
      : super(key: key);

  @override
  State<AdminApprovalPage> createState() => _AdminApprovalPageState();
}

class _AdminApprovalPageState extends State<AdminApprovalPage> {
  final PopAdminService _popAdminService = locator<PopAdminService>();
  final PopService _popService = locator<PopService>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: SafeArea(
      child: Column(
        children: [
          //const AdminNavBar(),
          titleBar(),
          questionTitle(),
          questionDescription(),
          author(),
          SizedBox(height: 10.h),
          tags(),
          buttonBar()
        ],
      ),
    ));
  }

  questionTitle() {
    return Container(
        width: 600.w,
        padding: EdgeInsets.symmetric(vertical: 30.h),
        child: Text(widget.popQuestion.questionTitle,
            textAlign: TextAlign.center,
            style:
                GoogleFonts.bebasNeue(color: primarycolor, fontSize: 50.sp)));
  }

  questionDescription() {
    return Container(
      height: 400.h,
      width: 600.w,
      padding: const EdgeInsets.all(2.0),
      //  decoration: BoxDecoration(border: Border.all(color: Colors.black)),
      child: SingleChildScrollView(
        scrollDirection: Axis.vertical,
        child: SingleChildScrollView(
            scrollDirection: Axis.vertical,
            child: Linkify(
              onOpen: (link) async {
                final Uri url = Uri.parse(link.url);
                if (await canLaunchUrl(url)) {
                  await launchUrl(url);
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content:
                        Text(AppLocalizations.of(context).unableToOpenLink),
                  ));
                }
              },
              text: widget.popQuestion.questionDesc,
              textAlign: TextAlign.left,
              style: GoogleFonts.roboto(color: Colors.black),
            )),
      ),
    );
  }

  author() {
    return Text('- ${widget.popQuestion.creator}');
  }

  tags() {
    return FutureBuilder<PopQuestionDetail>(
        future: _popService.getQuestionStat(widget.popQuestion.id),
        builder: (context, snapshot) {
          if (snapshot.hasData) {
            return Card(
                child: Container(
              width: 600.w,
              padding: const EdgeInsets.all(8.0),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _geoLocations(snapshot.data?.geoTags),
                    _interests(snapshot.data?.interestTags)
                  ]),
            ));
          }
          return Container();
        });

    // Row(
    //   children: [_geoLocations(), _interests()],
    // );
  }

  _geoLocations(List<PopLocation>? geoTags) {
    return RichText(
        text: TextSpan(
            text: AppLocalizations.of(context)
                .geographicalLocations, //'Localisations géographiques: ',
            style: const TextStyle(
                color: Colors.black, fontWeight: FontWeight.bold),
            children: [
          TextSpan(
              text: geoTags?.map((e) => e.label).join(','),
              style: const TextStyle(fontWeight: FontWeight.normal))
        ]));
  }

  _interests(List<PopInterest>? interests) {
    return RichText(
        text: TextSpan(
            text: AppLocalizations.of(context).interests, //'Intérêts:',
            style: const TextStyle(
                color: Colors.black, fontWeight: FontWeight.bold),
            children: [
          TextSpan(
              text: interests?.map((e) => e.label).join(','),
              style: const TextStyle(fontWeight: FontWeight.normal))
        ]));
  }

  buttonBar() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        (widget.popQuestion.status == 'ACTIVE')
            ? Container()
            : MaterialButton(
                color: primarycolor,
                onPressed: () =>
                    changeQuestionStatus("ACTIVE", widget.popQuestion.id),
                child: Text(AppLocalizations.of(context).toValidate,
                    style: const TextStyle(color: Colors.white))),
        SizedBox(width: 30.w),
        (widget.popQuestion.status == 'DRAFT')
            ? Container()
            : MaterialButton(
                color: primarycolor,
                onPressed: () =>
                    changeQuestionStatus("DRAFT", widget.popQuestion.id),
                child: Text(AppLocalizations.of(context).flip,
                    style: const TextStyle(color: Colors.white))),
        SizedBox(width: 30.w),
        (widget.popQuestion.status == 'IDLE')
            ? Container()
            : MaterialButton(
                color: Colors.white,
                onPressed: () =>
                    changeQuestionStatus("IDLE", widget.popQuestion.id),
                child: Text(AppLocalizations.of(context).toRefuse,
                    style: const TextStyle(color: primarycolor))),
      ],
    );
  }

  changeQuestionStatus(String status, int id) {
    _popAdminService.setQuestionStatus(status, id).then((value) {
      showSnackBrNotification(
          AppLocalizations.of(context).questionStatusUpdatedSuccessfully);
      Get.back(result: true);
    }).catchError((err) => showSnackBrNotification(
        AppLocalizations.of(context).cannotProcessRequest));
  }

  showSnackBrNotification(String message) {
    var snackBar = SnackBar(content: Text(message));
    ScaffoldMessenger.of(context).showSnackBar(snackBar);
  }

  titleBar() {
    return FlexTitleBar(
        leftButtonAction: () => Get.to(const SettingPage()),
        rightButtonAction: () => Get.to(QuestionSummaryPage()));
  }
}
