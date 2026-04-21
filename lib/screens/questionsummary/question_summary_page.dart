import 'package:flutter/material.dart';
import 'package:get/route_manager.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:pop/components/flex_title_bar.dart';
import 'package:pop/constants.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:pop/model/pop_app_user.dart';
import 'package:pop/screens/adminapproval/admin_all_questions_page.dart';
import 'package:pop/screens/questionspage/new_question_page.dart';
import 'package:pop/screens/questionsummary/user_answered_question_list.dart';
import 'package:pop/screens/questionsummary/user_authored_questions_list.dart';
import 'package:pop/screens/settings/setting_page.dart';
import 'package:pop/service/auth_service.dart';
import 'package:pop/service_locator.dart';
import 'package:pop/util.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class QuestionSummaryPage extends StatelessWidget {
  QuestionSummaryPage({Key? key}) : super(key: key);
  final AuthService _authService = locator<AuthService>();
  bool isLandScape = false;
  @override
  Widget build(BuildContext context) {
    isLandScape = MediaQuery.of(context).orientation == Orientation.landscape;
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            titleBar(),
            SizedBox(height: 40.h),
            // titleText(),
            // SizedBox(height: 30.h),
            // poplogo(),
            createQuestionButton(context),
            SizedBox(height: 50.h),
            questionanswerTab(context)
          ],
        ),
      ),
      floatingActionButton: _buildAprovalButtonIfAdmin(),
    );
  }

  titleBar() {
    //return Container(color: primarycolor, height: 86.h);
    return FlexTitleBar(
        rightEnabled: false,
        leftButtonAction: () => Get.to(const SettingPage()),
        rightButtonAction: () => {refreshPage()});
  }

  poplogo() {
    return GestureDetector(
      onTap: () => Get.to(const NewQuestionPage()),
      child: Image.asset('assets/images/pop_goto.png',
          height: 206.h, width: 257.w),
    );
  }

  questionanswerTab(context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10.0),
      child: DefaultTabController(
          length: 2, // length of tabs
          initialIndex: 0,
          child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: <Widget>[
                Container(
                  width: 400.w,
                  decoration: const BoxDecoration(
                      border: Border(
                    top: BorderSide(color: primarycolor),
                    bottom: BorderSide(color: primarycolor),
                    //left: BorderSide(color: primarycolor)
                  )),
                  child: TabBar(
                    // indicator: const BoxDecoration(
                    //     border: Border(right: BorderSide(color: primarycolor))),
                    labelColor: primarycolor,
                    unselectedLabelColor: Colors.black,
                    indicatorColor: Colors.transparent,
                    labelStyle: GoogleFonts.bebasNeue(
                        color: primarycolor, fontSize: 30.sp),
                    tabs: [
                      Row(
                        children: [
                          Image.asset('assets/images/your_question.png',
                              width: 94.w, height: 70.h),
                          SizedBox(width: 15.w),
                          Tab(
                              child: Text(
                                  AppLocalizations.of(context).myQuestion,
                                  style: TextStyle(
                                      fontSize: isLandScape ? 20.sp : 30.sp))),
                        ],
                      ),
                      Row(
                        children: [
                          Image.asset('assets/images/your_answer.png',
                              width: 94.w, height: 70.h),
                          SizedBox(width: 15.w),
                          Tab(
                              child: Text(
                                  AppLocalizations.of(context)
                                      .myAnswer, //'Vos réponses',
                                  style: TextStyle(
                                      fontSize: isLandScape ? 20.sp : 30.sp))),
                        ],
                      ),
                    ],
                  ),
                ),
                SizedBox(
                    height: 500.h, //height of TabBarView
                    child: const TabBarView(children: <Widget>[
                      UserAuthoredQuestionList(),
                      UserAnsweredQuestionList(),
                    ]))
              ])),
    );
  }

  _buildAprovalButtonIfAdmin() {
    return FutureBuilder<PopAppUser?>(
        future: _authService.getCurrentSignedInUser(),
        builder: (context, snapshot) {
          if (snapshot.hasData) {
            var popUser = snapshot.data;
            if (popUser != null && popUser.role == "ADMIN") {
              return SizedBox(
                height: isLandScape ? 200.h : 100.h,
                width: isLandScape ? 200.w : 100.h,
                child: FloatingActionButton(
                    backgroundColor: Colors.white,
                    onPressed: () => Get.to(const AdminAllQuestionsPage()),
                    child: Text(AppLocalizations.of(context).approvals,
                        style: GoogleFonts.bebasNeue(
                            fontSize: isTablet() ? 18.sp : 22.sp,
                            color: primarycolor))),
              );
            } else {
              return Container();
            }
          }
          return Container();
        });
  }

  refreshPage() {
    // ignore: todo
    //TODO: Placeholder method - will use this method for holding pgae refresh if needed
  }

  createQuestionButton(context) {
    return ElevatedButton(
      onPressed: () => Get.off(const NewQuestionPage()),
      style: ElevatedButton.styleFrom(
        backgroundColor: primarycolor,
        fixedSize: Size(300.r, 300.r),
        shape: const CircleBorder(),
      ),
      child: Text(
        AppLocalizations.of(context)
            .submitReferendum, //'ICI, SOUMETTEZ VOTRE REFERENDUM AUX VOTES DES CITOYENS',
        textAlign: TextAlign.center,
        style: GoogleFonts.bebasNeue(fontSize: isLandScape ? 15.sp : 35.sp),
      ),
    );
  }
}
