#import <React/RCTUIManager.h>
#import <React/RCTViewManager.h>

@interface JSourceTextManager : RCTViewManager
@end

@implementation JSourceTextManager

RCT_EXPORT_MODULE(JSourceText)

- (UIView *)view {
  return [[UIView alloc] init];
}

@end

@interface JSourceTextRunManager : RCTViewManager
@end

@implementation JSourceTextRunManager

RCT_EXPORT_MODULE(JSourceTextRun)

- (UIView *)view {
  return nil;
}

@end
