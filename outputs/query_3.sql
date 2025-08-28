SELECT
      `tickets`.ticketId `tickets__ticket_id`, count(`tickets`.ticketId) `tickets__ticket_count`
    FROM
      (
        SELECT
            ticket_id AS ticketId,
            max(ticket_closed_datetime) AS closedDatetime,
        FROM data_tickets
        GROUP BY ticketId
    ) AS `tickets`  WHERE ((1 = 1)) GROUP BY `tickets__ticket_id` ORDER BY `tickets__ticket_count` DESC LIMIT 10000