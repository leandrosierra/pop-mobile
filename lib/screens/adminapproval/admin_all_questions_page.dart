import 'package:flutter/material.dart';
import 'package:get/route_manager.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:pop/components/flex_title_bar.dart';
import 'package:pop/constants.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:pop/model/pop_question.dart';
import 'package:pop/screens/adminapproval/admin_approval_page.dart';
import 'dart:io' show Platform;

import 'package:pop/screens/homepage/home.dart';
import 'package:pop/screens/settings/setting_page.dart';
import 'package:pop/service/pop_admin_service.dart';
import 'package:pop/service_locator.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class AdminAllQuestionsPage extends StatefulWidget {
  const AdminAllQuestionsPage({Key? key}) : super(key: key);

  @override
  _AdminAllQuestionsPageState createState() => _AdminAllQuestionsPageState();
}

class _AdminAllQuestionsPageState extends State<AdminAllQuestionsPage> {
  late Future<Map<String, List<PopQuestion>>> _allQuestionsFuture;
  final PopAdminService _popAdminService = locator<PopAdminService>();

  @override
  void initState() {
    _allQuestionsFuture = _popAdminService.getAllQuestion();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            //blueBar(),
            titleBar(),
            questionsByCategoryTab(),
          ],
        ),
      ),
      floatingActionButton: reloadButton(),
    );
  }

  blueBar() {
    return Container(
      color: primarycolor,
      //height: 150.h,
      child: Row(
        mainAxisSize: MainAxisSize.max,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          backButton(),
          pop(),
          emptyContainer(),
        ],
      ),
    );
  }

  backButton() {
    return IconButton(
        onPressed: () => Get.back(),
        icon: Icon((Platform.isIOS) ? Icons.arrow_back_ios : Icons.arrow_back,
            color: Colors.white));
  }

  pop() {
    return GestureDetector(
      onTap: () => Get.offAll(const HomePage()),
      child: Text('POP',
          style: GoogleFonts.bebasNeue(color: Colors.white, fontSize: 70.sp)),
    );
  }

  emptyContainer() {
    return Container(width: 80.w);
  }

  questionsByCategoryTab() {
    return FutureBuilder<Map<String, List<PopQuestion>>>(
        future: _allQuestionsFuture,
        builder: (context, snapshot) {
          if (snapshot.hasData && snapshot.data != null) {
            var items = snapshot.data;
            if (items != null) {
              return DefaultTabController(
                length: 3,
                initialIndex: 0,
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      TabBar(tabs: [
                        Tab(
                            child: Text(
                                AppLocalizations.of(context).draftToValid,
                                style: GoogleFonts.bebasNeue(
                                    color: primarycolor))),
                        Tab(
                            child: Text(AppLocalizations.of(context).valid,
                                style: GoogleFonts.bebasNeue(
                                    color: primarycolor))),
                        Tab(
                            child: Text(AppLocalizations.of(context).rejected,
                                style: GoogleFonts.bebasNeue(
                                    color: primarycolor))),
                      ]),
                      SizedBox(
                        height: 900.h,
                        child: TabBarView(children: [
                          (items["DRAFT"] != null)
                              ? _buildQuestionList(items["DRAFT"])
                              : Padding(
                                  padding: const EdgeInsets.all(2.0),
                                  child: Text(AppLocalizations.of(context)
                                      .noQuestionAvailable)),
                          (items["ACTIVE"] != null)
                              ? _buildQuestionList(items["ACTIVE"])
                              : Padding(
                                  padding: const EdgeInsets.all(2.0),
                                  child: Text(AppLocalizations.of(context)
                                      .noQuestionAvailable)),
                          (items["IDLE"] != null)
                              ? _buildQuestionList(items["IDLE"])
                              : Padding(
                                  padding: const EdgeInsets.all(2.0),
                                  child: Text(AppLocalizations.of(context)
                                      .noQuestionAvailable)),
                        ]),
                      )
                    ]),
              );
            }
          } else if (snapshot.hasError) {
            return Text(AppLocalizations.of(context).dataAccessProblem);
          }
          return Text(AppLocalizations.of(context).loadingData);
        });
  }

  _buildQuestionList(questions) {
    return ListView.separated(
        itemCount: questions!.length,
        itemBuilder: (context, index) {
          return GestureDetector(
            onTap: () async {
              var response = await Get.to(
                  AdminApprovalPage(popQuestion: questions[index]));
              if (response) {
                setState(() {
                  _allQuestionsFuture = _popAdminService.getAllQuestion();
                });
              }
            },
            child: Padding(
              padding: const EdgeInsets.all(3.0),
              child: Row(
                mainAxisSize: MainAxisSize.max,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Flexible(
                      child: Text(
                    questions[index].questionTitle,
                    style: GoogleFonts.roboto(fontSize: 25.sp),
                  )),
                  const Icon(Icons.arrow_right)
                ],
              ),
            ),
          );
        },
        separatorBuilder: (BuildContext context, int index) => const Divider());
  }

  reloadButton() {
    return FloatingActionButton(
      onPressed: () => reload(),
      child: const Icon(Icons.refresh),
    );
  }

  reload() {
    setState(() => _allQuestionsFuture = _popAdminService.getAllQuestion());
  }

  titleBar() {
    return FlexTitleBar(
        leftButtonAction: () => Get.to(const SettingPage()),
        rightButtonAction: () => Get.back());
  }
}
