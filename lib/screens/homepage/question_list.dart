import 'dart:math';

import 'package:flutter/material.dart';
import 'package:get/route_manager.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:pop/components/question_card.dart';
import 'package:pop/constants.dart';
import 'package:pop/model/pop_question.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:pop/screens/homepage/question_explanation_page.dart';
import 'package:pop/screens/homepage/question_stat_page.dart';
import 'package:pop/screens/questionspage/new_question_page.dart';
import 'package:pop/service/pop_service.dart';
import 'package:pop/service_locator.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class QuestionList extends StatefulWidget {
  final List<PopQuestion> questions;
  final Function onReload;
  const QuestionList(
      {Key? key, required this.questions, required this.onReload})
      : super(key: key);

  @override
  _QuestionListState createState() => _QuestionListState();
}

class _QuestionListState extends State<QuestionList> {
  bool endOfQuestions = false;
  late List<PopQuestion> _popQuestions;
  final List<Color> _predefinedColorList = [];
  final PopService _popService = locator<PopService>();

  @override
  void initState() {
    _popQuestions = widget.questions;
    populatePredefinedColors();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return (_popQuestions.isEmpty)
        ? Container(
            width: 640.w,
            height: 840.h,
            color: cardColorOne,
            child: Column(
              children: [
                SizedBox(height: 300.h),
                Text(AppLocalizations.of(context).noMoreQuestions,
                    textAlign: TextAlign.center,
                    style: GoogleFonts.bebasNeue(
                        color: Colors.white, fontSize: 40.sp)),
                SizedBox(height: 50.h),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  mainAxisSize: MainAxisSize.max,
                  children: [
                    SizedBox(
                      width: 270.sp,
                      child: ElevatedButton(
                          onPressed: () => widget.onReload(),
                          child: Text(AppLocalizations.of(context).refresh)),
                    ),
                    SizedBox(
                      width: 270.sp,
                      child: ElevatedButton(
                          onPressed: () => Get.to(const NewQuestionPage()),
                          child: Text(
                            AppLocalizations.of(context).createNewQuestion,
                            textAlign: TextAlign.center,
                          )),
                    )
                  ],
                )
              ],
            ))
        : buildQuestionCards();
  }

  buildQuestionCards() {
    List<QuestionCard> questionCards = [];
    for (int i = 0; i < _predefinedColorList.length; i++) {
      var question = _popQuestions[i];
      questionCards.add(QuestionCard(
        popQuestion: question,
        cardColor: _predefinedColorList[i],
        onYes: onYes,
        onNo: onNo,
        onSkip: onNoOpinion,
        onMoreDetail: onMoreDetail,
        showOptions: i == _popQuestions.length - 1,
      ));
    }

    return Stack(children: questionCards);
  }

  onYes(PopQuestion question, Color cardColor) {
    updateResponse(question.id, "YES".toUpperCase())
        .then((data) => showQuestionStatePage(question, cardColor))
        .onError((error, stackTrace) {
      showQuestionStatePage(question, cardColor);
    });
    reloadIfEndOfquestion();
  }

  void navigateToNextQuestion() {}

  onNo(PopQuestion question, Color cardColor) {
    updateResponse(question.id, "NO".toUpperCase())
        .then((value) => showQuestionStatePage(question, cardColor))
        .onError((error, stackTrace) {
      showQuestionStatePage(question, cardColor);
    });
    reloadIfEndOfquestion();
  }

  onNoOpinion(PopQuestion question, Color cardColor) {
    updateResponse(question.id, "NEUTRAL".toUpperCase())
        .then((value) => setState(() {
              _popQuestions.removeLast();
              _predefinedColorList.removeLast();
            }));
    reloadIfEndOfquestion();
  }

  onMoreDetail(PopQuestion question, Color cardColor) {
    showModalBottomSheet(
        isScrollControlled: true,
        context: context,
        builder: (context) => Container(
            padding: EdgeInsets.only(
                top: MediaQueryData.fromView(WidgetsBinding.instance.window)
                    .padding
                    .top),
            child: QuestionExplanationPage(
                popQuestion: question, cardColor: cardColor)));
  }

  Future<void> updateResponse(int questionId, String response) {
    return _popService.addAnswerToQuestion(questionId, response);
  }

  showQuestionStatePage(PopQuestion question, Color cardColor) {
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
        });
    setState(() {
      _popQuestions.removeLast();
      _predefinedColorList.removeLast();
    });
  }

  void populatePredefinedColors() {
    for (int i = 0; i < _popQuestions.length; i++) {
      var randomNum = Random().nextInt(cardColors.length - 2);
      var nextColor = (_predefinedColorList.isEmpty)
          ? cardColorOne
          : cardColors
              .where((color) => color != _predefinedColorList.last)
              .toList()[randomNum];
      _predefinedColorList.add(nextColor);
    }
  }

  void reloadIfEndOfquestion() {
    if (_popQuestions.length == 1) widget.onReload();
  }
}
