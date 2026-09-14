import { type Ref, ref, watch } from "vue";
import type { DistrictId } from "#domain/prayer/prayer";

export function useDistrict(initial: DistrictId = "brunei") {
  const district = ref<DistrictId>(initial);

  function setDistrict(value: DistrictId) {
    district.value = value;
  }

  return { district, setDistrict };
}
