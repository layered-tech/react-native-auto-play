//
//  RCTLinkingManager+Custom.mm
//  Pods
//  Adds scene-launch URL support while preserving React Native's implementation.
//
//  Created by Manuel Auer on 11.12.25.
//

#import "NitroLinkingManager.h"
#import <React/RCTLinkingManager.h>
#import <objc/runtime.h>

@interface RCTLinkingManager (Custom)

- (void)autoPlay_getInitialURL:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject;

@end

@implementation RCTLinkingManager (Custom)

+ (void)load
{
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        Class targetClass = RCTLinkingManager.class;
        SEL originalSelector = NSSelectorFromString(@"getInitialURL:reject:");
        SEL replacementSelector =
            @selector(autoPlay_getInitialURL:reject:);
        Method originalMethod = class_getInstanceMethod(
            targetClass,
            originalSelector
        );
        Method replacementMethod = class_getInstanceMethod(
            targetClass,
            replacementSelector
        );

        if (originalMethod == NULL || replacementMethod == NULL) {
            return;
        }

        BOOL addedReplacement = class_addMethod(
            targetClass,
            originalSelector,
            method_getImplementation(replacementMethod),
            method_getTypeEncoding(replacementMethod)
        );

        if (addedReplacement) {
            class_replaceMethod(
                targetClass,
                replacementSelector,
                method_getImplementation(originalMethod),
                method_getTypeEncoding(originalMethod)
            );
            return;
        }

        method_exchangeImplementations(originalMethod, replacementMethod);
    });
}

- (void)autoPlay_getInitialURL:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject
{
    NSURL *initialURL = [NitroLinkingManager shared].launchURL;

    if (initialURL) {
        resolve(initialURL.absoluteString);
        return;
    }

    // Swizzling maps this selector back to React Native's original IMP.
    [self autoPlay_getInitialURL:resolve reject:reject];
}

@end
