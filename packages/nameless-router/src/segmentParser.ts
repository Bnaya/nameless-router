/*
  I've picked these values becouse they are not encoded by encodeURIComponent
  but we need to forbide using them as key/values in the url...
  We need to find a better way

  The best would be to find external library to handle that
*/
const VAR_SEP = "..";
const VALUE_SEP = "--";
const DEFAULT_KEY_NAME = "feature";

export function defaultSegmentParser(segment: string): any {
  if (segment === "") {
    return {};
  }

  return segment
    .split(VAR_SEP)
    .map(v => v.split(VALUE_SEP))
    .map(v => v.map(decodeURIComponent))
    .reduce(function reducer(p, [key, value]) {
      return {
        ...p,
        // when there is no value, we use key as value, and key will be the DEFAULT_KEY_NAME
        [value === undefined ? DEFAULT_KEY_NAME : key]:
          value === undefined ? key : value
      };
    }, {});
}

export function defaultSegmentSerializer(
  params: { [x: string]: string } | string
): string {
  if (typeof params === "string") {
    return params;
  }

  return Object.keys(params)
    .map(function(key) {
      return [key, params[key]];
    })
    .map(
      ([key, value]) =>
        key === DEFAULT_KEY_NAME
          ? value
          : `${encodeURIComponent(key)}${VALUE_SEP}${encodeURIComponent(value)}`
    )
    .join(VAR_SEP);
}
