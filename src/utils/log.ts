export function trace(stringToTrace: string) {
  if (process.env.TRACE_AWS_SDK_FLUENT_BUILDER) {
    console.log(stringToTrace);
  }
}
