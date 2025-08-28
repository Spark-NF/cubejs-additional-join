cube("Tickets", {
    sql: `
        SELECT
            ticket_id AS ticketId,
            max(ticket_closed_datetime) AS closedDatetime,
        FROM data_tickets
        GROUP BY ticketId
    `,
    segments: {
        closedTickets: {
            sql: `${FILTER_PARAMS.Tickets.closedDatetime.filter(`closedDatetime`)}`,
        },
    },
    measures: {
        ticketCount: {
            type: "count",
            sql: `${CUBE}.ticketId`,
        },
    },
    dimensions: {
        ticketId: {
            sql: `${CUBE}.ticketId`,
            type: "number",
            primaryKey: true,
            shown: true,
        },
    },
    joins: {
        Messages: {
            relationship: "one_to_one",
            sql: `${CUBE}.ticketId = ${Messages}.ticketId`,
        },
    },
});

cube("Messages", {
    sql: `
        SELECT
            ticket_id AS ticketId,
            count(ticket_message_id) AS messagesCount,
        FROM data_messages
        GROUP BY ticketId
    `,
    dimensions: {
        ticketId: {
            sql: `${CUBE}.ticketId`,
            type: "number",
            primaryKey: true,
            shown: true,
        },
    },
});
