SELECT
  t1.date,
  t1.cum_precip_in as cumulative_precip_in,
  cummulative_precip                                          AS normal_cumulative_precip_in,
  growing_cumulative_precip_in,
  growing_normal_cumulative_precip_in
FROM
  weather.annual_cumulative_precip t1
  LEFT JOIN weather.normalprecip t2
    ON date_part('day', t1.date) = date_part('day', t2.date)
       AND date_part('month', t1.date) = date_part('month', t2.date)

  LEFT JOIN (SELECT
               t1.date,
               cum_precip_in AS growing_cumulative_precip_in,
               cummulative_precip - (SELECT cummulative_precip
                                     FROM weather.normalprecip
                                     WHERE extract('doy' FROM date) = 104)
                             AS growing_normal_cumulative_precip_in
             FROM
               weather.growing_season_cumulative_precip t1
               LEFT JOIN weather.normalprecip t2
                 ON date_part('day', t1.date) = date_part('day', t2.date)
                    AND date_part('month', t1.date) = date_part('month', t2.date))
            t3
    ON t1.date = t3.date
WHERE date_part('year', t1.date) = date_part('year', now())
