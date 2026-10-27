#import "JSourceTextRun.h"
#import <React/RCTFabricComponentsPlugins.h>
#import "JSourceTextRunComponentDescriptor.h"
#import <react/renderer/components/JSourceTextSpec/Props.h>
#import <react/renderer/components/JSourceTextSpec/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface JSourceTextRun () <RCTJSourceTextRunViewProtocol>

@end

@implementation JSourceTextRun {
  NSString *_text;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<
      JSourceTextRunComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps =
        std::make_shared<const JSourceTextRunProps>();
    _props = defaultProps;
  }
  return self;
}

- (void)updateProps:(Props::Shared const &)props
           oldProps:(Props::Shared const &)oldProps {
  const auto &oldViewProps =
      *std::static_pointer_cast<JSourceTextRunProps const>(_props);
  const auto &newViewProps =
      *std::static_pointer_cast<JSourceTextRunProps const>(props);

  if (newViewProps.text != oldViewProps.text) {
    NSString *text = [NSString stringWithUTF8String:newViewProps.text.c_str()];
    _text = text;
  }

  [super updateProps:props oldProps:oldProps];
}

+ (BOOL)shouldBeRecycled {
  return NO;
}

Class<RCTComponentViewProtocol> JSourceTextRunCls(void) {
  return JSourceTextRun.class;
}

@end
