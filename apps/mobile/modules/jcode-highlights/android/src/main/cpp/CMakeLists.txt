cmake_minimum_required(VERSION 3.22.1)

project(jhighlights LANGUAGES C)

set(J_HIGHLIGHTS_ROOT "${CMAKE_CURRENT_SOURCE_DIR}/../../../..")

add_library(
  jhighlights SHARED
  j_highlights_jni.c
  "${J_HIGHLIGHTS_ROOT}/cpp/j_highlights.c"
  "${J_HIGHLIGHTS_ROOT}/Vendor/highlights/highlights.c"
  "${J_HIGHLIGHTS_ROOT}/Vendor/wasm2c/wasm-rt-impl.c"
  "${J_HIGHLIGHTS_ROOT}/Vendor/wasm2c/wasm-rt-mem-impl.c"
)

target_include_directories(
  jhighlights
  PRIVATE "${J_HIGHLIGHTS_ROOT}/cpp" "${J_HIGHLIGHTS_ROOT}/Vendor"
          "${J_HIGHLIGHTS_ROOT}/Vendor/highlights" "${J_HIGHLIGHTS_ROOT}/Vendor/wasm2c"
)

# Plain malloc memory with explicit bounds checks: no guard-page signal
# handlers competing with ART's.
target_compile_definitions(
  jhighlights PRIVATE WASM_RT_USE_MMAP=0 WASM_RT_MEMCHECK_BOUNDS_CHECK=1
                       WASM_RT_SKIP_SIGNAL_RECOVERY=1
)

# The lexers are generated code; keep them fast in debug builds too.
target_compile_options(jhighlights PRIVATE -O2)

target_link_options(
  jhighlights PRIVATE "-Wl,-z,common-page-size=16384" "-Wl,-z,max-page-size=16384"
)
