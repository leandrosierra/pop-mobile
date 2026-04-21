import 'package:flutter/material.dart';
import 'package:get/route_manager.dart';
import 'package:pop/components/flex_title_bar.dart';
import 'package:pop/components/question_card.dart';
import 'package:pop/constants.dart';
import 'package:pop/model/pop_question.dart';
import 'package:pop/screens/homepage/question_explanation_page.dart';
import 'package:pop/screens/homepage/question_stat_page.dart';
import 'package:pop/screens/settings/setting_page.dart';
import 'package:pop/service/pop_service.dart';
import 'package:pop/service_locator.dart';

class QuestionVotePage extends StatefulWidget {
  final PopQuestion question;
  final String oldResponse;
  const QuestionVotePage(
      {Key? key, required this.question, required this.oldResponse})
      : super(key: key);

  @override
  _QuestionVotePageState createState() => _QuestionVotePageState();
}

class _QuestionVotePageState extends State<QuestionVotePage> {
  final PopService _popService = locator<PopService>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            FlexTitleBar(
              leftButtonAction: () => Get.to(const SettingPage()),
              rightButtonAction: () => Get.back(),
            ),
            QuestionCard(
              popQuestion: widget.question,
              cardColor: primarycolor,
              onYes: onYes,
              onNo: onNo,
              onSkip: onNoOpinion,
              onMoreDetail: onMoreDetail,
            )
          ],
        ),
      ),
    );
  }

  onYes(PopQuestion question, Color cardColor) {
    updateResponse(question.id, "YES")
        .then((value) => showQuestionStatPage(question, cardColor, "YES"));
  }

  onNo(PopQuestion question, Color cardColor) {
    updateResponse(question.id, "NO")
        .then((value) => showQuestionStatPage(question, cardColor, "NO"));
  }

  onNoOpinion(PopQuestion question, Color cardColor) {
    updateResponse(question.id, "NEUTRAL")
        .then((value) => showQuestionStatPage(question, cardColor, "NEUTRAL"));
  }

  onMoreDetail(PopQuestion question, Color cardColor) {
    showModalBottomSheet(
        isScrollControlled: true,
        context: context,
        builder: (context) {
          return Container(
            padding: EdgeInsets.only(
                top: MediaQueryData.fromView(WidgetsBinding.instance.window)
                    .padding
                    .top),
            child: QuestionExplanationPage(
                popQuestion: widget.question, cardColor: cardColor),
          );
        });
  }

  showQuestionStatPage(
      PopQuestion question, Color cardColor, String newResponse) {
    showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        builder: (context) {
          return Container(
              padding: EdgeInsets.only(
                  top: MediaQueryData.fromView(WidgetsBinding.instance.window)
                      .padding
                      .top),
              child: QuestionStatPage(
                  popQuestion: question, cardColor: cardColor));
        }).then((result) => Navigator.pop(context, true));
  }

  Future<void> updateResponse(int questionId, String response) {
    return _popService.updateAnswerToQuestion(questionId, response);
  }
}
