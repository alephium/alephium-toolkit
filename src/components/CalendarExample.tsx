// import 'dayjs/locale/zh-cn'
// import dayjs from "dayjs"
// import { Group, Stack } from "@mantine/core";
// import { Calendar, DatePicker, DatesProvider } from "@mantine/dates";
// import { useEffect, useState } from 'react';

// function CalendarExample() {
//   const [selectedDate, setSelectedDate] = useState<Date>();
//   const [rangeDate, setRangeDate] = useState<[Date | null, Date | null]>([null, null]);

//   useEffect(() => {
//     console.log(selectedDate);
//   }, [selectedDate]);

//   return (
//     <Stack>
//     <Group position="center">
//       <DatesProvider settings={{ locale:"zh-cn" }}>
//         <Calendar getDayProps={(date) => ({
//           selected: selectedDate && dayjs(date).isSame(selectedDate, "day"),
//           onClick: () => setSelectedDate(date),
//         })}/>
//       </DatesProvider>
//     </Group>
//       <DatePicker type='range' allowSingleDateInRange value={rangeDate} onChange={setRangeDate}/>
//     </Stack>
//   );
// }

// export default CalendarExample;
