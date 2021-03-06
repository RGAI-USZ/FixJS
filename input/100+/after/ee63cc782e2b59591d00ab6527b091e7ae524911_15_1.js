function () {

  var now = new Date();
  Date.setLocale('pt');


  dateEqual(Date.create('15 de maio 2011'), new Date(2011, 4, 15), 'Date#create | basic Portuguese date');
  dateEqual(Date.create('5 de janeiro de 2012'), new Date(2012, 0, 5), 'Date#create | Portuguese | 2012-01-05');
  dateEqual(Date.create('maio de 2011'), new Date(2011, 4), 'Date#create | Portuguese | year and month');
  dateEqual(Date.create('15 de maio'), new Date(now.getFullYear(), 4, 15), 'Date#create | Portuguese | month and date');
  dateEqual(Date.create('2011'), new Date(2011, 0), 'Date#create | Portuguese | year');
  dateEqual(Date.create('maio'), new Date(now.getFullYear(), 4), 'Date#create | Portuguese | month');
  dateEqual(Date.create('segunda-feira'), getDateWithWeekdayAndOffset(1), 'Date#create | Portuguese | Monday');

  dateEqual(Date.create('5 de janeiro de 2012 3:45'), new Date(2012, 0, 5, 3, 45), 'Date#create | Portuguese | 2012-01-05 3:45');
  dateEqual(Date.create('5 de janeiro de 2012 3:45pm'), new Date(2012, 0, 5, 15, 45), 'Date#create | Portuguese | 2012-01-05 3:45pm');

  dateEqual(Date.create('um milisegundo atrás'), getRelativeDate(null, null, null, null, null, null,-1), 'Date#create | Portuguese | one millisecond ago');
  dateEqual(Date.create('um segundo atrás'), getRelativeDate(null, null, null, null, null, -1), 'Date#create | Portuguese | one second ago');
  dateEqual(Date.create('um minuto atrás'), getRelativeDate(null, null, null, null, -1), 'Date#create | Portuguese | one minute ago');
  dateEqual(Date.create('uma hora atrás'), getRelativeDate(null, null, null, -1), 'Date#create | Portuguese | one hour ago');
  dateEqual(Date.create('um dia atrás'), getRelativeDate(null, null, -1), 'Date#create | Portuguese | one day ago');
  dateEqual(Date.create('uma semana atrás'), getRelativeDate(null, null, -7), 'Date#create | Portuguese | one week');
  dateEqual(Date.create('há um mês'), getRelativeDate(null, -1), 'Date#create | Portuguese | one month ago');
  dateEqual(Date.create('há um ano'), getRelativeDate(-1), 'Date#create | Portuguese | one year ago');

  dateEqual(Date.create('daqui a 5 milisegundos'), getRelativeDate(null, null, null, null, null, null,5), 'Date#create | Portuguese | five milliseconds from now');
  dateEqual(Date.create('daqui a 5 segundos'), getRelativeDate(null, null, null, null, null, 5), 'Date#create | Portuguese | five second from now');
  dateEqual(Date.create('daqui a 5 minutos'), getRelativeDate(null, null, null, null, 5), 'Date#create | Portuguese | five minute from now');
  dateEqual(Date.create('daqui a 5 horas'), getRelativeDate(null, null, null, 5), 'Date#create | Portuguese | five hours from now');
  dateEqual(Date.create('daqui a 5 dias'), getRelativeDate(null, null, 5), 'Date#create | Portuguese | five day from now');
  dateEqual(Date.create('daqui a 5 semanas'), getRelativeDate(null, null, 35), 'Date#create | Portuguese | five weeks from now');
  dateEqual(Date.create('daqui a 5 mêses'), getRelativeDate(null, 5), 'Date#create | Portuguese | five months from now | mêses');
  dateEqual(Date.create('daqui a 5 anos'), getRelativeDate(5), 'Date#create | Portuguese | five years from now');


  dateEqual(Date.create('anteontem'), getRelativeDate(null, null, -2).resetTime(), 'Date#create | Portuguese | the day before yesterday');
  dateEqual(Date.create('ontem'), getRelativeDate(null, null, -1).resetTime(), 'Date#create | Portuguese | yesterday');
  dateEqual(Date.create('hoje'), getRelativeDate(null, null, 0).resetTime(), 'Date#create | Portuguese | today');
  dateEqual(Date.create('amanhã'), getRelativeDate(null, null, 1).resetTime(), 'Date#create | Portuguese | tomorrow');

  dateEqual(Date.create('semana passada'), getRelativeDate(null, null, -7), 'Date#create | Portuguese | Last week');
  dateEqual(Date.create('próxima semana'), getRelativeDate(null, null, 7), 'Date#create | Portuguese | Next week');

  dateEqual(Date.create('mês passado'), getRelativeDate(null, -1), 'Date#create | Portuguese | last month');
  dateEqual(Date.create('próximo mês'), getRelativeDate(null, 1), 'Date#create | Portuguese | Next month');

  dateEqual(Date.create('ano passado'), getRelativeDate(-1), 'Date#create | Portuguese | Last year');
  dateEqual(Date.create('próximo ano'), getRelativeDate(1), 'Date#create | Portuguese | Next year');

  dateEqual(Date.create('próximo segunda-feira'), getDateWithWeekdayAndOffset(1,  7), 'Date#create | Portuguese | next monday');
  dateEqual(Date.create('passada segunda-feira'), getDateWithWeekdayAndOffset(1, -7), 'Date#create | Portuguese | last monday');

  dateEqual(Date.create('passada segunda-feira 3:45'), getDateWithWeekdayAndOffset(1, -7).set({ hour: 3, minute: 45 }, true), 'Date#create | Portuguese | last monday 3:45');

  // no accents
  dateEqual(Date.create('daqui a 5 meses'), getRelativeDate(null, 5), 'Date#create | Portuguese | five months from now | meses');
  dateEqual(Date.create('mes passado'), getRelativeDate(null, -1), 'Date#create | Portuguese | last month');
  dateEqual(Date.create('proximo ano'), getRelativeDate(1), 'Date#create | Portuguese | Next year');
  dateEqual(Date.create('uma hora atras'), getRelativeDate(null, null, null, -1), 'Date#create | Portuguese | one hour ago');
  dateEqual(Date.create('ha um ano'), getRelativeDate(-1), 'Date#create | Portuguese | one year ago');
  dateEqual(Date.create('amanha'), getRelativeDate(null, null, 1).resetTime(), 'Date#create | Portuguese | tomorrow');


  equal(Date.create('1890-04-07').format(), '7 de abril de 1890', 'Date#create | Portuguese | standard format');
  equal(Date.create('2011-08-25').format('{dd} de {month} {yyyy}'), '25 de agosto 2011', 'Date#create | Portuguese | format');


  equal(Date.create('1 second ago').relative(), '1 segundo atrás', 'Date#create | Portuguese | relative format past');
  equal(Date.create('1 minute ago').relative(), '1 minuto atrás',  'Date#create | Portuguese | relative format past');
  equal(Date.create('1 hour ago').relative(),   '1 hora atrás',     'Date#create | Portuguese | relative format past');
  equal(Date.create('1 day ago').relative(),    '1 dia atrás',    'Date#create | Portuguese | relative format past');
  equal(Date.create('1 week ago').relative(),   '1 semana atrás',  'Date#create | Portuguese | relative format past');
  equal(Date.create('1 month ago').relative(),  '1 mês atrás',   'Date#create | Portuguese | relative format past');
  equal(Date.create('1 year ago').relative(),   '1 ano atrás',     'Date#create | Portuguese | relative format past');

  equal(Date.create('2 seconds ago').relative(), '2 segundos atrás', 'Date#create | Portuguese | relative format past');
  equal(Date.create('2 minutes ago').relative(), '2 minutos atrás',  'Date#create | Portuguese | relative format past');
  equal(Date.create('2 hours ago').relative(),   '2 horas atrás',     'Date#create | Portuguese | relative format past');
  equal(Date.create('2 days ago').relative(),    '2 dias atrás',    'Date#create | Portuguese | relative format past');
  equal(Date.create('2 weeks ago').relative(),   '2 semanas atrás',  'Date#create | Portuguese | relative format past');
  equal(Date.create('2 months ago').relative(),  '2 mêses atrás',   'Date#create | Portuguese | relative format past');
  equal(Date.create('2 years ago').relative(),   '2 anos atrás',     'Date#create | Portuguese | relative format past');

  equal(Date.create('1 second from now').relative(), 'daqui a 1 segundo', 'Date#create | Portuguese | relative format future');
  equal(Date.create('1 minute from now').relative(), 'daqui a 1 minuto',  'Date#create | Portuguese | relative format future');
  equal(Date.create('1 hour from now').relative(),   'daqui a 1 hora',     'Date#create | Portuguese | relative format future');
  equal(Date.create('1 day from now').relative(),    'daqui a 1 dia',    'Date#create | Portuguese | relative format future');
  equal(Date.create('1 week from now').relative(),   'daqui a 1 semana',  'Date#create | Portuguese | relative format future');
  equal(Date.create('1 month from now').relative(),  'daqui a 1 mês',   'Date#create | Portuguese | relative format future');
  equal(Date.create('1 year from now').relative(),   'daqui a 1 ano',     'Date#create | Portuguese | relative format future');

  equal(Date.create('5 second from now').relative(), 'daqui a 5 segundos', 'Date#create | Portuguese | relative format future');
  equal(Date.create('5 minute from now').relative(), 'daqui a 5 minutos',  'Date#create | Portuguese | relative format future');
  equal(Date.create('5 hour from now').relative(),   'daqui a 5 horas',     'Date#create | Portuguese | relative format future');
  equal(Date.create('5 day from now').relative(),    'daqui a 5 dias',    'Date#create | Portuguese | relative format future');
  equal(Date.create('5 week from now').relative(),   'daqui a 1 mês',  'Date#create | Portuguese | relative format future');
  equal(Date.create('5 month from now').relative(),  'daqui a 5 mêses',   'Date#create | Portuguese | relative format future');
  equal(Date.create('5 year from now').relative(),   'daqui a 5 anos',     'Date#create | Portuguese | relative format future');

}