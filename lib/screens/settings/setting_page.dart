import 'package:flutter/material.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:get/route_manager.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:pop/components/dialog/confirmation_dialog.dart';
import 'package:pop/components/title_bar.dart';
import 'package:pop/constants.dart';
import 'package:pop/model/pop_app_user.dart';
import 'package:pop/model/pop_interest.dart';
import 'package:pop/model/pop_location.dart';
import 'package:pop/model/user_interest.dart';
import 'package:pop/screens/questionspage/geo_location_search.dart';
import 'package:pop/screens/questionspage/question_interest_selection.dart';
import 'package:pop/screens/settings/change_password_screen.dart';
import 'package:pop/screens/setup/search_item.dart';
import 'package:pop/screens/signup/signup.dart';
import 'package:pop/service/auth_service.dart';
import 'package:pop/service/pop_service.dart';
import 'package:pop/service_locator.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class SettingPage extends StatefulWidget {
  const SettingPage({Key? key}) : super(key: key);

  @override
  State<SettingPage> createState() => _SettingPageState();
}

class _SettingPageState extends State<SettingPage> {
  final AuthService _authService = locator<AuthService>();
  final PopService _popService = locator<PopService>();
  late List<UserInterest> userInterests;
  late List<PopLocation> userGeoLocations;

  bool reload = false;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            const TitleBar(),
            FutureBuilder<PopAppUser?>(
                future: _authService.getCurrentSignedInUser(force: true),
                builder: (BuildContext context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.done) {
                    if (snapshot.hasError) {
                      return const Center(
                        child: Text(
                            "Erreur de chargement des informations de l'utilisateur"),
                      );
                    } else if (snapshot.hasData && snapshot.data != null) {
                      var appUser = snapshot.data;
                      userGeoLocations =
                          appUser != null ? appUser.userChoiceGeo : [];
                      userInterests =
                          appUser != null ? appUser.userInterest : [];
                      return Expanded(
                        child: SingleChildScrollView(
                          child: Column(
                            children: [
                              Text(appUser!.name,
                                  style: GoogleFonts.bebasNeue(
                                      fontSize: 50.sp, color: primarycolor)),
                              SizedBox(height: 45.h),
                              locationBox(appUser.userChoiceGeo),
                              SizedBox(height: 60.h),
                              interestBox(appUser.userInterest),
                              FutureBuilder<bool>(
                                  future: isEmailUser(),
                                  builder: (context, snapshot) {
                                    if (snapshot.hasData) {
                                      bool? isEmailUser = snapshot.data;
                                      return (isEmailUser != null &&
                                              isEmailUser)
                                          ? Column(children: [
                                              SizedBox(height: 25.h),
                                              changePasswordButton()
                                            ])
                                          : Container();
                                    } else {
                                      return Container();
                                    }
                                  }),
                              // isEmailUser()
                              //     ? changePasswordButton()
                              //     : Container(),
                              SizedBox(height: 40.h),
                              Row(mainAxisSize: MainAxisSize.min, children: [
                                deleteAccountButton(),
                                SizedBox(width: 20.w),
                                logoutButton()
                              ]),
                            ],
                          ),
                        ),
                      );
                    }
                  }
                  return const Center(child: CircularProgressIndicator());
                })
          ],
        ),
      ),
    );
  }

  locationBox(List<PopLocation> geochoices) {
    return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          GestureDetector(
            onTap: () => showGeoSearchDialog(),
            child: Image.asset('assets/images/SETTINGS GEO.png',
                height: 88.h, width: 93.w),
          ),
          SizedBox(width: 10.w),
          SizedBox(
            // height: 310.h,
            width: 400.w,
            child: Column(
              children: geochoices
                  .map((e) => SearchItem(
                        text: Expanded(
                            child: Text(e.label,
                                style: TextStyle(fontSize: 30.sp))),
                        initialState: true,
                        onPress: (val) => removeUserGeo(e),
                        iconSize: 60.sp,
                      ))
                  .toList(),
            ),
          )
        ]);
  }

  showGeoSearchDialog() {
    showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        builder: (builder) {
          return Container(
              padding: EdgeInsets.only(
                  top: MediaQueryData.fromView(WidgetsBinding.instance.window)
                      .padding
                      .top),
              child: GeoLocationSearch(exclutionList: userGeoLocations));
          //return const GeoLocationSearch();
        }).then((value) {
      if (value == null || value.isEmpty) return;
      List<PopLocation> valueToSave = filterAlreadyExistingGeoLocation(value);
      if (valueToSave.isEmpty) return;
      EasyLoading.show(
          status: AppLocalizations.of(context).savingYourPreference);
      _popService.saveGeoLocation(valueToSave).then((value) {
        setState(() => reload = true);
        EasyLoading.dismiss();
      }).catchError((e) {
        EasyLoading.dismiss();
        EasyLoading.showError(
            'Unable to save location preference. Please try again later.');
      });
    });
  }

  void showInterestSearchDialog() {
    showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        builder: (builder) => Container(
            padding: EdgeInsets.only(
                top: MediaQueryData.fromView(WidgetsBinding.instance.window)
                    .padding
                    .top),
            child: const InterestSearch())).then((value) {
      if (value == null || value.isEmpty) return;
      List<PopInterest> valueToSave = filterAlreadyExistingInterest(value);
      if (valueToSave.isEmpty) return;
      EasyLoading.show(
          status: AppLocalizations.of(context).savingYourPreference);
      _popService.saveInterest(valueToSave).then((value) {
        setState(() => reload = true);
        EasyLoading.dismiss();
      }).catchError((e) {
        EasyLoading.dismiss();
        EasyLoading.showError(
            'Unable to save interest preference. Please try again later.');
      });
    });
  }

  interestBox(List<UserInterest> interests) {
    return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          GestureDetector(
            onTap: () => showInterestSearchDialog(),
            child: Image.asset('assets/images/setting_interest.png',
                height: 88.h, width: 93.w),
          ),
          SizedBox(width: 10.w),
          SizedBox(
            width: 400.w,
            child: Column(
              children: interests
                  .map((e) => SearchItem(
                        text: Expanded(
                            child: Text(e.label,
                                style: TextStyle(fontSize: 30.sp))),
                        initialState: true,
                        onPress: (val) => removeInterest(e),
                        iconSize: 60.sp,
                      ))
                  .toList(),
            ),
          )
        ]);
  }

  removeUserGeo(PopLocation location) {
    EasyLoading.show(status: AppLocalizations.of(context).savingYourPreference);
    _popService.removeUserGeoLocation(location).then((value) {
      EasyLoading.dismiss();
      setState(() {
        userGeoLocations.remove(location);
      });
    }).catchError((err) {
      EasyLoading.dismiss();
      EasyLoading.showError('Failed with remove location');
    });
  }

  removeInterest(UserInterest userInterest) {
    EasyLoading.show(status: AppLocalizations.of(context).savingYourPreference);
    _popService.removeUserInterest(userInterest).then((value) {
      EasyLoading.dismiss();
      userInterests.remove(userInterest);
    }).catchError((err) {
      EasyLoading.dismiss();
      EasyLoading.showError('Failed with remove interest');
    });
  }

  logoutButton() {
    return ElevatedButton(
      onPressed: _showSignoutConfirmationDialog,
      style: ElevatedButton.styleFrom(backgroundColor: primarycolor),
      child: Text(AppLocalizations.of(context).logout),
    );
  }

  _showSignoutConfirmationDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return ConfirmationDialog(
            title: 'Confirmation',
            content: AppLocalizations.of(context)
                .areYourSureLogout, //"Êtes vous sûr de vouloir vous déconnecter ?",
            cancelText: AppLocalizations.of(context).no,
            confirmText: AppLocalizations.of(context).yes);
      },
    ).then((value) => {if (value) _logout()});
  }

  _showDeleteConfirmationDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return ConfirmationDialog(
            content: AppLocalizations.of(context).areYouSureToDeleteAccount1 +
                AppLocalizations.of(context).areYouSureToDeleteAccount2,
            // "Êtes vous sûr de vouloir supprimer votre compte? Une fois votre compte supprimé, toutes "
            //"vos données dont votre profil, vos questions et réponses seront définitivement supprimés.",
            cancelText: AppLocalizations.of(context).no,
            confirmText: AppLocalizations.of(context).yes);
      },
    ).then((value) => {if (value) _deleteAccount()});
  }

  deleteAccountButton() {
    return ElevatedButton(
      onPressed: _showDeleteConfirmationDialog,
      style: ElevatedButton.styleFrom(backgroundColor: Colors.white),
      child: Text(AppLocalizations.of(context).deleteAccount,
          style: const TextStyle(color: Colors.red)),
    );
  }

  _deleteAccount() {
    EasyLoading.show(
        status: AppLocalizations.of(context).pleaseWaitProcessingRequest);
    _authService.deleteAccount().then((value) {
      EasyLoading.dismiss();
      Get.offAll(const SignupScreen());
    }).catchError((err) {
      EasyLoading.dismiss();
      EasyLoading.showError(
          'Nous ne pouvons pas accéder à votre demande. Veuillez réessayer plus tard');
    });
  }

  _logout() {
    _authService.signout();
    Get.offAll(const SignupScreen());
  }

  List<PopInterest> filterAlreadyExistingInterest(selectedInterest) {
    var userInterestSettingCodes = userInterests.map((i) => i.code).toList();
    return selectedInterest
        .where((i) => !userInterestSettingCodes.contains(i.code))
        .toList();
  }

  List<PopLocation> filterAlreadyExistingGeoLocation(selectedGeoLocation) {
    return selectedGeoLocation
        .where((i) => !userGeoLocations.contains(i))
        .toList();
  }

  changePasswordButton() {
    return GestureDetector(
      onTap: () => Get.to(ChangePasswordScreen()),
      child: Column(
        children: [
          //IconButton(
          //onPressed: () => Get.to(ChangePasswordScreen()),
          //icon:
          Icon(
            Icons.lock_open_outlined,
            color: primarycolor,
            size: 75.sp,
          ),
          //),
          Container(
            padding: const EdgeInsets.all(8),
            //color: prEdgeimarycolor,
            decoration: BoxDecoration(
                color: primarycolor,
                borderRadius: BorderRadius.all(Radius.circular(15.h))),
            child: Text(
              AppLocalizations.of(context)
                  .changeMyPassword, //'Modifier mon mot',
              style: TextStyle(color: Colors.white, fontSize: 35.sp),
            ),
          )
        ],
      ),
    );
  }

  Future<bool> isEmailUser() {
    return _authService.isEmailUser();
  }
}
