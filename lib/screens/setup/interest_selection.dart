import 'package:flutter/material.dart';
import 'package:get/route_manager.dart';
import 'package:pop/components/selection_item.dart';
import 'package:pop/constants.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:pop/model/pop_interest.dart';
import 'package:pop/screens/homepage/home.dart';
import 'package:pop/service/pop_service.dart';
import 'package:pop/service_locator.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class InterestSelection extends StatefulWidget {
  const InterestSelection({Key? key}) : super(key: key);

  @override
  _InterestSelectionState createState() => _InterestSelectionState();
}

class _InterestSelectionState extends State<InterestSelection> {
  //late AnimateIconController c1, c2;
  List<PopInterest> interestList = [];
  final PopService _popService = locator<PopService>();
  late Future<List<PopInterest>> _interestListFuture;

  List<PopInterest> selectedInterest = [];
  bool selectAll = false;

  @override
  void initState() {
    //c1 = AnimateIconController();
    //c2 = AnimateIconController();
    _interestListFuture = _popService.getAllPopInterest();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    MediaQueryData queryData = MediaQuery.of(context);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Container(
            // height: queryData.size.height,
            width: queryData.size.width,
            color: Colors.white,
            child: Column(children: [
              Container(
                  color: primarycolor, width: double.infinity, height: 40.h),
              SizedBox(height: 40.h),
              Image.asset(
                'assets/images/setting_interest.png',
                height: 146.h,
                width: 164.w,
              ),
              SizedBox(height: 70.h),
              Text(AppLocalizations.of(context).selectInterest,
                  style: TextStyle(color: primarycolor, fontSize: 23.sp)),
              SizedBox(height: 30.h),
              suggestionList(),
              SizedBox(height: 70.h),
              okbutton()
            ]),
          ),
        ),
      ),
    );
  }

  suggestionList() {
    return FutureBuilder<List<PopInterest>>(
        future: _interestListFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.done) {
            if (snapshot.hasError) {
              return const Center(child: Text('Error fetching the Interest'));
            } else if (snapshot.hasData) {
              interestList = snapshot.data ?? [];
              var interestWidgt = interestList
                  .map((e) => SelectionItem(
                        text: e.label,
                        onPress: (val) => onInterestSelection(val, e),
                        initialState: selectedInterest.contains(e),
                      ))
                  .toList();
              interestWidgt.insert(0, selectAllButton());

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.start,
                children: interestWidgt,
              );
            }
          }
          return Center(
              child: Text(AppLocalizations.of(context).loadingInterestList));
        });
  }

  SelectionItem selectAllButton() => SelectionItem(
        text: AppLocalizations.of(context).selectAll, //'Tout selectionner',
        initialState: selectAll,
        onPress: (value) {
          setState(() {
            selectAll = value;
            (selectAll)
                ? selectedInterest.addAll(interestList)
                : selectedInterest.clear();
          });
        },
      );

  okbutton() {
    return MaterialButton(
      onPressed: saveInterest,
      color: primarycolor,
      padding: const EdgeInsets.all(16),
      shape: const CircleBorder(),
      child: const Text('OK', style: TextStyle(color: Colors.white)),
    );
  }

  void saveInterest() {
    if (selectedInterest.isEmpty) {
      var snackBar = SnackBar(
          content: Text(AppLocalizations.of(context).chooseOneInterest));
      ScaffoldMessenger.of(context).showSnackBar(snackBar);
      return;
    }
    _popService.saveInterest(selectedInterest).then((value) {
      Get.offAll(const HomePage());
    }).catchError((error) {
      const snackBar =
          SnackBar(content: Text("Erreur dans la sauvergarde des intérêts"));
      ScaffoldMessenger.of(context).showSnackBar(snackBar);
    });
  }

  onInterestSelection(bool selected, PopInterest interest) {
    setState(() {
      (selected)
          ? selectedInterest.add(interest)
          : selectedInterest.remove(interest);
    });
  }
}
