/** Chỉ lấy giá trị route, không decode/encode lại vì Document ID là chuỗi định danh nguyên vẹn. */
export function getRouteParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
