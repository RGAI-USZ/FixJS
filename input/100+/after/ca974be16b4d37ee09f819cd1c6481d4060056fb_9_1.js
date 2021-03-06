function () {

  var now = new Date();
  Date.setLocale('ko');

  dateEqual(Date.create('2011년5월15일'), new Date(2011, 4, 15), 'Date#create | basic Korean date');
  dateEqual(Date.create('2011년5월'), new Date(2011, 4), 'Date#create | Korean | year and month');
  dateEqual(Date.create('5월15일'), new Date(now.getFullYear(), 4, 15), 'Date#create | Korean | month and date');
  dateEqual(Date.create('2011년'), new Date(2011, 0), 'Date#create | Korean | year');
  dateEqual(Date.create('5월'), new Date(now.getFullYear(), 4), 'Date#create | Korean | month');
  dateEqual(Date.create('15일'), new Date(now.getFullYear(), now.getMonth(), 15), 'Date#create | Korean | date');
  dateEqual(Date.create('월요일'), getDateWithWeekdayAndOffset(1), 'Date#create | Korean | Monday');
  dateEqual(Date.create('구일'), new Date(now.getFullYear(), now.getMonth(), 9), 'Date#create | Korean | the 9th');
  dateEqual(Date.create('이십오일'), new Date(now.getFullYear(), now.getMonth(), 25), 'Date#create | Korean | the 25th');
  dateEqual(Date.create('한달 전'), getRelativeDate(null, -1), 'Date#create | Korean | one month ago 달');


  dateEqual(Date.create('2011년5월15일 3:45'), new Date(2011, 4, 15, 3, 45), 'Date#create | basic Korean date 3:45');
  dateEqual(Date.create('2011년5월15일 3:45pm'), new Date(2011, 4, 15, 15, 45), 'Date#create | basic Korean date 3:45pm');
  dateEqual(Date.create('2011년5월15일 오후 3시 45분'), new Date(2011, 4, 15, 15, 45), 'Date#create | basic Korean date full korean letters');

  dateEqual(Date.create('1밀리초 전'), getRelativeDate(null, null, null, null, null, null,-1), 'Date#create | Korean | one millisecond ago');
  dateEqual(Date.create('1초 전'), getRelativeDate(null, null, null, null, null, -1), 'Date#create | Korean | one second ago');
  dateEqual(Date.create('1분 전'), getRelativeDate(null, null, null, null, -1), 'Date#create | Korean | one minute ago');
  dateEqual(Date.create('1시간 전'), getRelativeDate(null, null, null, -1), 'Date#create | Korean | one hour ago');
  dateEqual(Date.create('1일 전'), getRelativeDate(null, null, -1), 'Date#create | Korean | one day ago');
  dateEqual(Date.create('1주 전'), getRelativeDate(null, null, -7), 'Date#create | Korean | one week');
  dateEqual(Date.create('1개월 전'), getRelativeDate(null, -1), 'Date#create | Korean | one month ago 개월');
  dateEqual(Date.create('1년 전'), getRelativeDate(-1), 'Date#create | Korean | one year ago');


  dateEqual(Date.create('5밀리초 후'), getRelativeDate(null, null, null, null, null, null,5), 'Date#create | Korean | five millisecond from now');
  dateEqual(Date.create('5초 후'), getRelativeDate(null, null, null, null, null, 5), 'Date#create | Korean | five second from now');
  dateEqual(Date.create('5분 후'), getRelativeDate(null, null, null, null, 5), 'Date#create | Korean | five minute from now');
  dateEqual(Date.create('5시간 후'), getRelativeDate(null, null, null, 5), 'Date#create | Korean | five hour from now');
  dateEqual(Date.create('5일 후'), getRelativeDate(null, null, 5), 'Date#create | Korean | five day from now');
  dateEqual(Date.create('5주 후'), getRelativeDate(null, null, 35), 'Date#create | Korean | five weeks from now');
  dateEqual(Date.create('5개월 후'), getRelativeDate(null, 5), 'Date#create | Korean | five months 개월');
  dateEqual(Date.create('5년 후'), getRelativeDate(5), 'Date#create | Korean | five years from now');

  dateEqual(Date.create('그저께'), getRelativeDate(null, null, -2).resetTime(), 'Date#create | Korean | 그저께');
  dateEqual(Date.create('어제'), getRelativeDate(null, null, -1).resetTime(), 'Date#create | Korean | yesterday');
  dateEqual(Date.create('오늘'), getRelativeDate(null, null, 0).resetTime(), 'Date#create | Korean | today');
  dateEqual(Date.create('내일'), getRelativeDate(null, null, 1).resetTime(), 'Date#create | Korean | tomorrow');
  dateEqual(Date.create('모레'), getRelativeDate(null, null, 2).resetTime(), 'Date#create | Korean | 모레');

  dateEqual(Date.create('내일 3:45'), getRelativeDate(null, null, 1).set({ hours: 3, minutes: 45 }), 'Date#create | Korean | tomorrow with time 3:45');
  dateEqual(Date.create('내일 3:45pm'), getRelativeDate(null, null, 1).set({ hours: 15, minutes: 45 }), 'Date#create | Korean | tomorrow with time 3:45pm');

  dateEqual(Date.create('지난 주'), getRelativeDate(null, null, -7), 'Date#create | Korean | Last week');
  dateEqual(Date.create('이번 주'), getRelativeDate(null, null, 0), 'Date#create | Korean | this week');
  dateEqual(Date.create('다음 주'), getRelativeDate(null, null, 7), 'Date#create | Korean | Next week');

  dateEqual(Date.create('지난 달'), getRelativeDate(null, -1), 'Date#create | Korean | last month');
  dateEqual(Date.create('이번 달'), getRelativeDate(null, 0), 'Date#create | Korean | this month');
  dateEqual(Date.create('다음 달'), getRelativeDate(null, 1), 'Date#create | Korean | Next month');

  dateEqual(Date.create('작년'), getRelativeDate(-1), 'Date#create | Korean | Last year');
  dateEqual(Date.create('내년'), getRelativeDate(1), 'Date#create | Korean | Next year');


  dateEqual(Date.create('지난 주 수요일'), getDateWithWeekdayAndOffset(3, -7), 'Date#create | Korean | Last wednesday');
  dateEqual(Date.create('이번 일요일'), getDateWithWeekdayAndOffset(0), 'Date#create | Korean | this sunday');
  dateEqual(Date.create('다음 주 금요일'), getDateWithWeekdayAndOffset(5, 7), 'Date#create | Korean | Next friday');


  equal(Date.create('2011-08-25').format(), '2011년8월25일', 'Date#create | Korean | standard format');
  equal(Date.create('2011-08-25').format('{yyyy}년{MM}월{dd}일'), '2011년08월25일', 'Date#create | Korean | format');


  equal(Date.create('1 second ago').relative(), '1초 전', 'Date#create | Korean | relative format past');
  equal(Date.create('1 minute ago').relative(), '1분 전',  'Date#create | Korean | relative format past');
  equal(Date.create('1 hour ago').relative(),   '1시간 전',     'Date#create | Korean | relative format past');
  equal(Date.create('1 day ago').relative(),    '1일 전',    'Date#create | Korean | relative format past');
  equal(Date.create('1 week ago').relative(),   '1주 전',  'Date#create | Korean | relative format past');
  equal(Date.create('1 month ago').relative(),  '1개월 전',   'Date#create | Korean | relative format past');
  equal(Date.create('1 year ago').relative(),   '1년 전',     'Date#create | Korean | relative format past');

  equal(Date.create('2 seconds ago').relative(), '2초 전', 'Date#create | Korean | relative format past');
  equal(Date.create('2 minutes ago').relative(), '2분 전',  'Date#create | Korean | relative format past');
  equal(Date.create('2 hours ago').relative(),   '2시간 전',     'Date#create | Korean | relative format past');
  equal(Date.create('2 days ago').relative(),    '2일 전',    'Date#create | Korean | relative format past');
  equal(Date.create('2 weeks ago').relative(),   '2주 전',  'Date#create | Korean | relative format past');
  equal(Date.create('2 months ago').relative(),  '2개월 전',   'Date#create | Korean | relative format past');
  equal(Date.create('2 years ago').relative(),   '2년 전',     'Date#create | Korean | relative format past');

  equal(Date.create('1 second from now').relative(), '1초 후', 'Date#create | Korean | relative format future');
  equal(Date.create('1 minute from now').relative(), '1분 후',  'Date#create | Korean | relative format future');
  equal(Date.create('1 hour from now').relative(),   '1시간 후',     'Date#create | Korean | relative format future');
  equal(Date.create('1 day from now').relative(),    '1일 후',    'Date#create | Korean | relative format future');
  equal(Date.create('1 week from now').relative(),   '1주 후',  'Date#create | Korean | relative format future');
  equal(Date.create('1 month from now').relative(),  '1개월 후',   'Date#create | Korean | relative format future');
  equal(Date.create('1 year from now').relative(),   '1년 후',     'Date#create | Korean | relative format future');

  equal(Date.create('5 second from now').relative(), '5초 후', 'Date#create | Korean | relative format future');
  equal(Date.create('5 minute from now').relative(), '5분 후',  'Date#create | Korean | relative format future');
  equal(Date.create('5 hour from now').relative(),   '5시간 후',     'Date#create | Korean | relative format future');
  equal(Date.create('5 day from now').relative(),    '5일 후',    'Date#create | Korean | relative format future');
  equal(Date.create('5 week from now').relative(),   '1개월 후',  'Date#create | Korean | relative format future');
  equal(Date.create('5 month from now').relative(),  '5개월 후',   'Date#create | Korean | relative format future');
  equal(Date.create('5 year from now').relative(),   '5년 후',     'Date#create | Korean | relative format future');

}