-- Fix cho trigger tính TotalAmount sai
-- Thay đổi trigger để sử dụng TotalPrice đã computed thay vì tính lại Quantity * UnitPrice

ALTER TRIGGER trg_InvoiceItem_UpdateInvoiceTotal
ON InvoiceItem
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    UPDATE I
    SET TotalAmount = ISNULL(T.Total, 0)
    FROM Invoice I
    LEFT JOIN (
        -- Sử dụng TotalPrice đã computed thay vì tính lại
        SELECT InvoiceID, SUM(TotalPrice) AS Total
        FROM InvoiceItem
        GROUP BY InvoiceID
    ) T ON I.InvoiceID = T.InvoiceID
    WHERE I.InvoiceID IN (
        SELECT InvoiceID FROM inserted
        UNION
        SELECT InvoiceID FROM deleted
    )
END