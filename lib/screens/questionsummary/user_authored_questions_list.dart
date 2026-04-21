import 'package:flutter/material.dart';
import 'package:get/route_manager.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:pop/constants.dart';
import 'package:pop/model/pop_question.dart';
import 'package:pop/screens/homepage/question_stat_page.dart';
import 'package:pop/service/pop_service.dart';
import 'package:pop/service_locator.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:pop/util.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class UserAuthoredQuestionList extends StatefulWidget {
  const UserAuthoredQuestionList({Key? key}) : super(key: key);

  @override
  State<UserAuthoredQuestionList> createState() =>
      _UserAuthoredQuestionListState();
}

class _UserAuthoredQuestionListState extends State<UserAuthoredQuestionList>
    with AutomaticKeepAliveClientMixin {
  final PopService _popService = locator<PopService>();
  late Future<List<PopQuestion>> userAuthoredQuestionFuture;

  @override
  void initState() {
    userAuthoredQuestionFuture = _popService.getUserAuthoredQuestions();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return FutureBuilder<List<PopQuestion>>(
        future: userAuthoredQuestionFuture,
        builder:
            (BuildContext context, AsyncSnapshot<List<PopQuestion>> snapshot) {
          if (snapshot.connectionState == ConnectionState.done) {
            if (snapshot.hasError) {
              return Center(
                child: Text(
                    AppLocalizations.of(context).errorFetchingQuestionList),
              );
            } else if (snapshot.hasData) {
              var questions = snapshot.data;
              return Padding(
                padding: const EdgeInsets.only(top: 2.0),
                child: ListView.separated(
                  itemCount: questions!.length,
                  itemBuilder: (context, index) {
                    return InkWell(
                        onTap: () => Get.to(QuestionStatPage(
                              popQuestion: questions[index],
                              cardColor: primarycolor,
                            )),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 3.0),
                          child: Text(
                            questions[index].questionTitle,
                            style: GoogleFonts.roboto(
                                fontSize: isTablet() ? 16.sp : 18.sp,
                                fontStyle: FontStyle.italic),
                          ),
                        ));
                  },
                  separatorBuilder: (BuildContext context, int index) =>
                      const Divider(),
                ),
              );
            }
          }
          return const Center(
              child: Center(child: CircularProgressIndicator()));
        });
  }

  @override
  bool get wantKeepAlive => true;
}
