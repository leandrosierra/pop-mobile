import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:pop/model/pop_answered_question.dart';
import 'package:pop/model/pop_question.dart';
import 'package:pop/screens/questionsummary/question_vote_page.dart';
import 'package:pop/service/pop_service.dart';
import 'package:pop/service_locator.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class UserAnsweredQuestionList extends StatefulWidget {
  const UserAnsweredQuestionList({Key? key}) : super(key: key);

  @override
  State<UserAnsweredQuestionList> createState() =>
      _UserAnsweredQuestionListState();
}

class _UserAnsweredQuestionListState extends State<UserAnsweredQuestionList>
    with AutomaticKeepAliveClientMixin {
  final PopService _popService = locator<PopService>();
  late Future<List<PopAnsweredQuestion>> userAnsweredQuestionFuture;

  @override
  void initState() {
    userAnsweredQuestionFuture = _popService.getUserAnsweredQuestions();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return FutureBuilder<List<PopAnsweredQuestion>>(
        future: userAnsweredQuestionFuture,
        builder: (BuildContext context,
            AsyncSnapshot<List<PopAnsweredQuestion>> snapshot) {
          if (snapshot.connectionState == ConnectionState.done) {
            if (snapshot.hasError) {
              return Center(
                child: Text(AppLocalizations.of(context)
                    .errorFetchingQuestionList), //'Error fetching the question list'),
              );
            } else if (snapshot.hasData) {
              var questions = snapshot.data;
              return Padding(
                padding: const EdgeInsets.only(top: 2.0),
                child: ListView.separated(
                  itemCount: questions!.length,
                  itemBuilder: (context, index) {
                    return questionAndAnswer(questions[index]);
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

  questionAndAnswer(PopAnsweredQuestion question) {
    return InkWell(
      onTap: () async {
        Navigator.push(
            context,
            MaterialPageRoute(
                builder: (BuildContext context) => QuestionVotePage(
                    question: PopQuestion(question.id, question.questionTitle,
                        question.creator, question.questionDescription, ''),
                    oldResponse: question.response))).then((value) {
          if (value != null) {
            bool shouldRefresh = value;
            if (shouldRefresh) {
              setState(() => userAnsweredQuestionFuture =
                  _popService.getUserAnsweredQuestions());
            }
          }
        });
      },
      child: Padding(
        padding: const EdgeInsets.all(3.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Q: ${question.questionTitle}',
                style: GoogleFonts.roboto(
                    fontStyle: FontStyle.italic,
                    fontSize: 18.sp,
                    fontWeight: FontWeight.bold)),
            Text('A: ${question.response}',
                style: GoogleFonts.roboto(
                    fontStyle: FontStyle.italic, fontSize: 18.sp))
          ],
        ),
      ),
    );
  }

  @override
  bool get wantKeepAlive => true;
}
