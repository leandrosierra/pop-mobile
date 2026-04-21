# Pop


### iOS Build process

To run the ios build, run the below commands

> cd ios
> pod install --repo-update 
> cd ..
> flutter run

__Note__
Make sure the ruby version is more than 2.6.0 and install the cocopod gem with `gem install cocoapods` command and install cocopod dependencies with `pod setup`  

## Localisation

To rebuild the localisation files execute the below command.

> flutter gen-l10n


### Release 
## Android
To release got to the `android/key.properties` file and update the storeFile location to reflect your system path. Once done, then run below command.

Also make sure you increment the app version code and version aswell.

> flutter build appbundle

Locate the aab file using the path printed in the log of above command. Then upload this aab file to the play store.

## IOS

Open the ios sub project using the xcode. 

1. update the version and build numbers.
2. Under product menu select the archive option.
3. Once archive is done, a window will open showing the archive. Now select the validate app option.
4. In validation window, Click next with default option.
5. Once analysis is done, Click on the distribute app optiom.
6. Select the distribute through app connect for testflight option.
7. And in next screen, select upload option, then select  next option with the default options  whatever selected.
8. In Final screen, select upload button.


### Note

In case while importing the project for first time to a new machine , and building the project fails. This could proabably happens because the flutter sdk used in original machine and current machine maight be different.

The recent version of flutter on which app is built on is **Flutter 3.3.9**

In such case try modifying the gradle version matching the current flutter sdk persent in the machine. 


## Release note:

The Android had some ealry release so the version code is different for both ios and android.
So keep track of version code and change the same in below while during the new release 
android : version - 5 , version code: 1.0.4
ios: version - 2, version code 1.0.1

As per the playstore instruction, the app target version is increased from level 31 to level 33. Also the flutter version is upgrded to 3.31 and the depedency version also have been upgraded. The UI issue in the region selection page is done
android version : 10 (1.0.3)
ios version: TBD