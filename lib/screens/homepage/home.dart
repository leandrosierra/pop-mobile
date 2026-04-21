import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:pop/components/title_bar.dart';
import 'package:pop/constants.dart';
import 'package:pop/model/pop_question.dart';
import 'package:pop/screens/homepage/question_list.dart';
import 'package:pop/service/pop_service.dart';
import 'package:pop/service_locator.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class HomePage extends StatefulWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final PopService _popService = locator<PopService>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: SafeArea(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: <Widget>[
          const TitleBar(),
          FutureBuilder(
            future: getAllQuestionsForUser(),
            builder: (BuildContext context, AsyncSnapshot<dynamic> snapshot) {
              if (snapshot.connectionState == ConnectionState.done) {
                if (snapshot.hasError) {
                  return Center(
                    child: Text(
                        AppLocalizations.of(context).errorFetchingQuestion),
                  );
                } else if (snapshot.hasData) {
                  return QuestionList(
                      questions: snapshot.data,
                      onReload: () {
                        setState(() {});
                      });
                }
              }
              return SizedBox(
                height: 840.h,
                width: 644.w,
                child: Center(
                    child: Text(
                        //'Attendez svp, les questions arrivent selon vos préférences',
                        AppLocalizations.of(context).pleaseWaitQuestionArrives,
                        style: GoogleFonts.bebasNeue(color: primarycolor),
                        textAlign: TextAlign.center)),
              );
            },
          ),
        ],
      ),
    ));
  }

  Future<List<PopQuestion>> getAllQuestionsForUser() {
    return _popService.listQuestion();
  }
}
