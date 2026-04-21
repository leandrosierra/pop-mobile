import 'package:flutter/material.dart';
import 'package:get/route_manager.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:pop/components/title_bar.dart';
import 'package:pop/constants.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:pop/model/pop_interest.dart';
import 'package:pop/model/pop_location.dart';
import 'package:pop/model/pop_question_request.dart';
import 'package:pop/screens/homepage/home.dart';
import 'package:pop/screens/questionspage/geo_location_search.dart';
import 'package:pop/screens/questionspage/question_interest_selection.dart';
import 'package:pop/screens/setup/search_item.dart';
import 'package:pop/service/pop_service.dart';
import 'package:pop/service_locator.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class NewQuestionPage extends StatefulWidget {
  const NewQuestionPage({Key? key}) : super(key: key);

  @override
  _NewQuestionPageState createState() => _NewQuestionPageState();
}

class _NewQuestionPageState extends State<NewQuestionPage> {
  final PopService _popService = locator<PopService>();
  List<PopLocation> locationsTagged = [];
  List<PopInterest> interestsTagged = [];
  final questionTitleCtrl = TextEditingController();
  final questionDescCtrl = TextEditingController();
  bool _isSaveInProgress = false;

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    var subtitleFont = GoogleFonts.roboto(
        fontSize: 20.sp, color: primarycolor, fontStyle: FontStyle.italic);
    var titleFont = GoogleFonts.roboto(color: primarycolor, fontSize: 27.sp);
    return GestureDetector(
      onTap: () => FocusManager.instance.primaryFocus?.unfocus(),
      child: Scaffold(
        resizeToAvoidBottomInset: false,
        body: SafeArea(
          child: SingleChildScrollView(
            reverse: true,
            child: Column(
              children: [
                const TitleBar(),
                Text(
                    AppLocalizations.of(context)
                        .proposeReferendumHere
                        .toUpperCase(),
                    style: titleFont),
                Text(
                    AppLocalizations.of(context)
                        .directDemocracyForImprovement, //'Une démocratie directe \npour une amélioration de la politique en continu!',
                    textAlign: TextAlign.center,
                    style: subtitleFont),
                // Text('pour une amélioration de la politique en continu!',
                //     style: subtitleFont),
                SizedBox(height: 10.h),
                questionTextField(),
                SizedBox(height: 10.h),
                Text(
                    AppLocalizations.of(context)
                        .detailAndDocumentYourReferendum
                        .toUpperCase(),
                    style: GoogleFonts.roboto(
                        fontSize: 23.sp, color: primarycolor)),
                SizedBox(height: 10.h),
                questionExplainationInputText(),
                SizedBox(height: 20.h),
                Text(
                    AppLocalizations.of(context)
                        .chooseGeographicalAreaAndInterest, //'Choisissez les zones geographiques\n et intérêts de votre référendum',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.roboto(
                        fontSize: 23.sp, color: primarycolor)),
                SizedBox(height: 20.h),
                questionTagSelection(),
                okbutton(),
                Padding(
                    padding: EdgeInsets.only(
                        bottom: MediaQuery.of(context).viewInsets.bottom))
              ],
            ),
          ),
        ),
      ),
    );
  }

  Container questionExplainationInputText() {
    return Container(
      height: 236.h,
      width: 601.w,
      padding: EdgeInsets.only(left: 30.w, right: 30.w, top: 10.h, bottom: 0),
      decoration: BoxDecoration(border: Border.all(color: primarycolor)),
      child: TextField(
        controller: questionDescCtrl,
        keyboardType: TextInputType.multiline,
        maxLines: 8,
        decoration: const InputDecoration(
            border: InputBorder.none, contentPadding: EdgeInsets.all(0)),
        style: GoogleFonts.roboto(fontSize: 30.sp, color: Colors.black),
      ),
    );
  }

  Container questionTextField() {
    return Container(
        height: 160.h,
        width: 601.w,
        padding:
            EdgeInsets.only(left: 115.w, top: 10.w, right: 115.w, bottom: 0),
        decoration: BoxDecoration(border: Border.all(color: primarycolor)),
        child: TextField(
          textInputAction: TextInputAction.go,
          controller: questionTitleCtrl,
          style: GoogleFonts.bebasNeue(fontSize: 30.sp, color: primarycolor),
          textAlign: TextAlign.center,
          keyboardType: TextInputType.multiline,
          decoration: const InputDecoration(
              border: InputBorder.none,
              counter: Offstage(),
              contentPadding: EdgeInsets.all(0)),
          maxLines: 3,
          maxLength: 120,
        ));
  }

  questionTagSelection() {
    return SizedBox(
      width: 650.w,
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        GestureDetector(
          onTap: () => showGeoSearchDialog(),
          child: Image.asset('assets/images/SETTINGS GEO.png',
              height: 88.h, width: 93.w),
        ),
        SizedBox(width: 10.w),
        SizedBox(
            height: 310.h,
            width: 190.w,
            child: ListView.builder(
                shrinkWrap: true,
                scrollDirection: Axis.vertical,
                itemCount: locationsTagged.length,
                itemBuilder: (BuildContext context, int index) {
                  return questionTag(
                      locationsTagged[index].label,
                      (val) => setState(
                          () => locationsTagged.remove(locationsTagged[index])),
                      true);
                })),
        GestureDetector(
          onTap: () => showInterestSearchDialog(),
          child: Image.asset(
            'assets/images/setting_interest.png',
            height: 88.h,
            width: 93.w,
          ),
        ),
        SizedBox(width: 10.w),
        SizedBox(
            height: 310.h,
            width: 190.w,
            child: ListView.builder(
                shrinkWrap: true,
                scrollDirection: Axis.vertical,
                itemCount: interestsTagged.length,
                itemBuilder: (BuildContext context, int index) {
                  return questionTag(
                      interestsTagged[index].label,
                      (val) => setState(
                          () => interestsTagged.remove(interestsTagged[index])),
                      true);
                })),
      ]),
    );
  }

  questionTag(label, onpressFunc, initialVal) {
    return SearchItem(
        onPress: onpressFunc,
        initialState: initialVal,
        text: Expanded(
          child: Text(label,
              //overflow: TextOverflow.ellipsis,
              style: GoogleFonts.roboto(fontSize: 25.sp, color: Colors.black)),
        ));
  }

  okbutton() {
    return MaterialButton(
      height: 90.h,
      onPressed: _isSaveInProgress ? null : saveQuestion,
      color: primarycolor,
      padding: const EdgeInsets.all(16),
      shape: const CircleBorder(),
      child: const Text('OK', style: TextStyle(color: Colors.white)),
    );
  }

  void showGeoSearchDialog() {
    showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        builder: (builder) {
          return Container(
              padding: EdgeInsets.only(
                  top: MediaQueryData.fromView(WidgetsBinding.instance.window)
                      .padding
                      .top),
              child: const GeoLocationSearch());
        }).then((value) {
      if (value.length + locationsTagged.length <= 5) {
        var filteresResult =
            value.where((i) => !locationsTagged.contains(i)).toList();
        setState(() {
          locationsTagged.addAll(filteresResult);
        });
      } else {
        var snackBar = SnackBar(
            content: Text(AppLocalizations.of(context).youCanTagMax5Locations));
        ScaffoldMessenger.of(context).showSnackBar(snackBar);
      }
    });
  }

  void showInterestSearchDialog() {
    showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        builder: (builder) {
          return Container(
              padding: EdgeInsets.only(
                  top: MediaQueryData.fromView(WidgetsBinding.instance.window)
                      .padding
                      .top),
              child: const InterestSearch());
        }).then((value) {
      //if (value.length + interestsTagged.length <= 5) {
      var filteresResult =
          value.where((i) => !interestsTagged.contains(i)).toList();
      setState(() {
        interestsTagged.addAll(filteresResult);
      });
      // } else {
      //   const snackBar =
      //       SnackBar(content: Text("You can tag at max 5 interests only"));
      //   ScaffoldMessenger.of(context).showSnackBar(snackBar);
      // }
    });
  }

  void saveQuestion() {
    String? errorMessge;
    FocusManager.instance.primaryFocus?.unfocus();
    if (questionTitleCtrl.text.trim().isEmpty) {
      errorMessge = "Entrez votre question svp :";
    } else if (questionDescCtrl.text.trim().isEmpty) {
      errorMessge =
          "Entrez les informations et ressources realtives à votre question:";
    } else if (locationsTagged.isEmpty) {
      errorMessge = "Entez au minimum une geolocalisation ";
    } else if (interestsTagged.isEmpty) {
      errorMessge = "Entez au minimum un intérêt ";
    }

    if (errorMessge != null) {
      var snackBar = SnackBar(content: Text(errorMessge));
      ScaffoldMessenger.of(context).showSnackBar(snackBar);
      return;
    }

    var interestList = interestsTagged.map((e) => e.code).toList();
    PopQuestionRequest questionRequest = PopQuestionRequest(
        questionTitleCtrl.text,
        questionDescCtrl.text,
        locationsTagged,
        interestList);
    setState(() => _isSaveInProgress = true);
    _popService.saveQuestion(questionRequest).then((value) {
      setState(() => _isSaveInProgress = false);
      var snackBar = SnackBar(
          content:
              Text(AppLocalizations.of(context).questionCreatedSuccessfully));
      ScaffoldMessenger.of(context).showSnackBar(snackBar);
      clearFields();
      Get.offAll(const HomePage());
    }).catchError((err) {
      setState(() => _isSaveInProgress = false);
      const snackBar = SnackBar(
          content: Text("Problem in creating question. Please try later."));
      ScaffoldMessenger.of(context).showSnackBar(snackBar);
    });
  }

  void clearFields() {
    questionDescCtrl.clear();
    questionTitleCtrl.clear();
    setState(() {
      locationsTagged.clear();
      interestsTagged.clear();
    });
  }
}
