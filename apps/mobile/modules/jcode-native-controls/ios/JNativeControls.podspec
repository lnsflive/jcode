Pod::Spec.new do |s|
  s.name           = 'JNativeControls'
  s.version        = '1.0.0'
  s.summary        = 'Native UIKit controls for JCode mobile.'
  s.description    = 'UIKit-backed controls that match native iOS navigation chrome.'
  s.author         = 'LNSFLIVE'
  s.homepage       = 'https://jaimegonzalezjr.com'
  s.platforms      = {
    :ios => '18.0',
  }
  s.source         = { :path => '.' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }
  s.resource_bundles = { 'JNativeControlIcons' => ['Resources/Icons/pull-request*.png'] }
  s.source_files = '**/*.{h,m,mm,swift,hpp,cpp}'
end
