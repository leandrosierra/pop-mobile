import 'dart:async';
import 'dart:math';

import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_svg/svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:pop/model/pop_question.dart';
import 'package:pop/util.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class QuestionCard extends StatefulWidget {
  final PopQuestion popQuestion;
  final Color cardColor;
  final Function onYes;
  final Function onNo;
  final Function onSkip;
  final Function onMoreDetail;
  final bool showOptions;

  const QuestionCard(
      {Key? key,
      required this.popQuestion,
      required this.cardColor,
      required this.onYes,
      required this.onNo,
      required this.onSkip,
      required this.onMoreDetail,
      this.showOptions = true})
      : super(key: key);

  @override
  State<QuestionCard> createState() => _QuestionCardState();
}

class _QuestionCardState extends State<QuestionCard> {
  Offset _cardSwipePositon = Offset.zero;
  bool _isCardDragged = false;
  Size _screenSize = Size.zero;
  double _angle = 0;

  @override
  void initState() {
    _isCardDragged = false;
    _cardSwipePositon = Offset.zero;
    _angle = 0;
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((timeStamp) {
      _screenSize = MediaQuery.of(context).size;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 35.w, vertical: 10.h),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          widget.showOptions
              ? GestureDetector(
                  onPanStart: onPanStart,
                  onPanEnd: onPanEnd,
                  onPanUpdate: onPanUpdate,
                  child: LayoutBuilder(
                    builder:
                        (BuildContext context, BoxConstraints constraints) {
                      //final center = constraints.
                      final center = constraints.smallest.center(Offset.zero);
                      final angle = _angle * pi / 180;
                      final rotatedMatrix = Matrix4.identity()
                        ..translate(center.dx, center.dy)
                        ..rotateZ(angle)
                        ..translate(-center.dx, -center.dy);
                      return AnimatedContainer(
                        duration:
                            Duration(milliseconds: (_isCardDragged) ? 0 : 400),
                        transform: rotatedMatrix
                          ..translate(
                              _cardSwipePositon.dx, _cardSwipePositon.dy),
                        child: Stack(children: [cardContent(), stamp()]),
                      );
                    },
                  ),
                )
              : Container(),
          widget.showOptions ? options() : Container(),
        ],
      ),
    );
  }

  cardContent() {
    return Container(
      height: isTabletAndLandScape() ? 800.h : 810.h,
      width: 644.w,
      color: widget.cardColor,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          SizedBox(height: isTabletAndLandScape() ? 80.h : 100.h),
          SizedBox(
            width: 500.w,
            height: isTabletAndLandScape() ? 300.h : 450.h,
            child: AutoSizeText(widget.popQuestion.questionTitle,
                textAlign: TextAlign.center,
                style: GoogleFonts.bebasNeue(
                    color: Colors.white,
                    fontSize: isTabletAndLandScape() ? 50.sp : 85.sp)),
          ),
          SizedBox(height: 30.h),
          informationIcon(),
          SizedBox(height: 20.h),
        ],
      ),
    );
  }

  stamp() {
    var cardStatus = getStatus(true);
    var opacity = getStampOpacity();
    switch (cardStatus) {
      case PopCardStatus.yes:
        return Positioned(
            top: 65.h,
            left: 50.w,
            child: buildStamp(-0.5, Colors.white, 'Yes', opacity));
      case PopCardStatus.no:
        return Positioned(
            top: 65.h,
            right: 50.w,
            child: buildStamp(0.5, Colors.white, 'No', opacity));
      case PopCardStatus.skip:
        return Positioned(
            top: 40.h,
            left: 170.w,
            child: buildStamp(0.0, Colors.white, 'No Opinion', opacity));
      default:
        return Container();
    }
  }

  getStampOpacity() {
    const delta = 100;
    final pos = max(_cardSwipePositon.dx.abs(), _cardSwipePositon.dy.abs());
    final opacity = pos / delta;
    return min(opacity, 1.0);
  }

  buildStamp(angle, color, text, opacity) {
    return Opacity(
      opacity: opacity,
      child: Transform.rotate(
        angle: angle,
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 8.h),
          decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.white, width: 5.w)),
          child: Text(text,
              style: GoogleFonts.bebasNeue(color: color, fontSize: 100.sp)),
        ),
      ),
    );
  }

  signature() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.end,
      textBaseline: TextBaseline.ideographic,
      children: [
        //Icon(Icons.person, color: Colors.white, size: 35),
        SvgPicture.asset('assets/icons/signature.svg', height: 43.h),
        Text(widget.popQuestion.creator,
            style: const TextStyle(
                fontStyle: FontStyle.italic, color: Colors.white))
      ],
    );
  }

  informationIcon() {
    // return IconButton(
    //     onPressed: () =>
    //         widget.onMoreDetail(widget.popQuestion, widget.cardColor),
    //     icon: const Icon(Icons.info_rounded, color: Colors.white, size: 35));
    return MaterialButton(
      color: Colors.white,
      shape: const CircleBorder(),
      onPressed: () =>
          widget.onMoreDetail(widget.popQuestion, widget.cardColor),
      child: Padding(
        padding: EdgeInsets.all(isTabletAndLandScape() ? 20.h : 20.h),
        child: Text(
          AppLocalizations.of(context).moreInfo,
          textAlign: TextAlign.center,
          style: GoogleFonts.bebasNeue(
              color: widget.cardColor,
              fontSize: isTabletAndLandScape() ? 20.sp : 30.sp,
              fontWeight: FontWeight.w800),
        ),
      ),
    );
  }

  options() {
    return Container(
      width: 600.w,
      padding: EdgeInsets.only(top: 25.h),
      child: Row(
          mainAxisSize: MainAxisSize.max,
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            optionButton(
                Text(AppLocalizations.of(context).no,
                    style: GoogleFonts.bebasNeue(
                        color: Colors.white,
                        fontSize: computeOptionTextsize())),
                () => no()),
            optionButton(
                Text(AppLocalizations.of(context).noOpinion,
                    textAlign: TextAlign.center,
                    style: GoogleFonts.bebasNeue(
                        color: Colors.white,
                        fontSize: computeNoOpinionTextsize(),
                        fontWeight: FontWeight.normal)),
                () => skip()),
            optionButton(
                Text(AppLocalizations.of(context).yes,
                    style: GoogleFonts.bebasNeue(
                        color: Colors.white,
                        fontSize: computeOptionTextsize())),
                () => yes()),
          ]),
    );
  }

  double computeNoOpinionTextsize() {
    bool isLandScape =
        MediaQuery.of(context).orientation == Orientation.landscape;
    return isTablet()
        ? isLandScape
            ? 17.sp
            : 25.sp
        : 30.sp;
  }

  double computeOptionTextsize() {
    bool isLandScape =
        MediaQuery.of(context).orientation == Orientation.landscape;
    return isTablet()
        ? isLandScape
            ? 30.sp
            : 60.sp
        : 75.sp;
  }

  optionButton(Text text, action) {
    return ElevatedButton(
        style: ElevatedButton.styleFrom(
            shape: const CircleBorder(), backgroundColor: widget.cardColor),
        onPressed: action,
        child: SizedBox(
            width: optionButtonWidth,
            height: optionbuttonHeight,
            child: Center(child: text)));
  }

  double get optionbuttonHeight {
    if (isTablet()) {
      bool isLandScape =
          MediaQuery.of(context).orientation == Orientation.landscape;
      return isLandScape ? 160.h : 120.h;
    }
    return 115.h;
  }

  double get optionButtonWidth {
    if (isTablet()) {
      bool isLandScape =
          MediaQuery.of(context).orientation == Orientation.landscape;
      return isLandScape ? 160.w : 120.w;
    }
    return 125.w;
  }

  onPanStart(DragStartDetails detail) {
    setState(() {
      _isCardDragged = true;
    });
  }

  onPanUpdate(DragUpdateDetails detail) {
    final x = _cardSwipePositon.dx;
    setState(() {
      _cardSwipePositon += detail.delta;
      _angle = 45 * x / _screenSize.width;
    });
  }

  onPanEnd(detail) {
    var cardStatus = getStatus(false);
    if (cardStatus == null) {}
    switch (cardStatus) {
      case PopCardStatus.yes:
        yes();
        break;
      case PopCardStatus.no:
        no();
        break;
      case PopCardStatus.skip:
        skip();
        break;
      case PopCardStatus.more:
        more();
        break;
      default:
        reset();
        break;
    }
  }

  PopCardStatus? getStatus(bool force) {
    final x = _cardSwipePositon.dx;
    final y = _cardSwipePositon.dy;
    final forceMoreDetail = x.abs() < 20;
    var delta = (force) ? 30 : 100;
    if (x >= delta) {
      return PopCardStatus.yes;
    } else if (x <= -delta) {
      return PopCardStatus.no;
    } else if (y <= -delta / 2 && forceMoreDetail) {
      return PopCardStatus.more;
    } else if (y >= delta / 2) {
      return PopCardStatus.skip;
    }
    return null;
  }

  void yes() {
    setState(() {
      _isCardDragged = false;
      _angle = 20;
      _cardSwipePositon += Offset(_screenSize.width * 2, 0);
    });
    widget.onYes(widget.popQuestion, widget.cardColor);
    // showResultPage();
  }

  void no() {
    setState(() {
      _isCardDragged = false;
      _angle = -20;
      _cardSwipePositon -= Offset(_screenSize.width * 2, 0);
    });
    widget.onNo(widget.popQuestion, widget.cardColor);
  }

  void skip() {
    setState(() {
      _isCardDragged = false;
      _cardSwipePositon -= Offset(0, _screenSize.height);
      _angle = 0;
    });
    widget.onSkip(widget.popQuestion, widget.cardColor);
  }

  void more() {
    setState(() {
      _isCardDragged = false;
      _cardSwipePositon = Offset.zero;
      _angle = 0;
    });
    widget.onMoreDetail(widget.popQuestion, widget.cardColor);

    // showModalBottomSheet(
    //     isScrollControlled: true,
    //     context: context,
    //     builder: (context) {
    //       return QuestionExplanationPage(
    //           popQuestion: widget.popQuestion, cardColor: widget.cardColor);
    //     });
  }

  bool isTabletAndLandScape() {
    bool isLandScape =
        MediaQuery.of(context).orientation == Orientation.landscape;
    return isLandScape & isTablet();
  }

  void reset() {
    setState(() {
      _isCardDragged = false;
      _cardSwipePositon = Offset.zero;
      _angle = 0;
    });
  }

  Future showResultPage() async {
    await Future.delayed(const Duration(milliseconds: 300));
  }
}

enum PopCardStatus {
  yes,
  no,
  skip,
  more,
}
