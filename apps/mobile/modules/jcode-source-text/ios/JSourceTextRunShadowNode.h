#pragma once

#include <react/renderer/components/JSourceTextSpec/EventEmitters.h>
#include <react/renderer/components/JSourceTextSpec/Props.h>
#include <react/renderer/components/JSourceTextSpec/States.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>

namespace facebook::react {
extern const char JSourceTextRunComponentName[];

using JSourceTextRunShadowNode =
    ConcreteViewShadowNode<JSourceTextRunComponentName, JSourceTextRunProps,
                           JSourceTextRunEventEmitter, JSourceTextRunState>;
} // namespace facebook::react
