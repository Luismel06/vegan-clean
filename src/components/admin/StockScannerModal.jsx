import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { CheckCircle2, Plus, ScanLine, Trash2, X } from "lucide-react";

const panelColor = (theme) => theme.cardBackground || theme.surface || theme.background;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 4200;
  background: rgba(0, 0, 0, 0.45);
  display: grid;
  place-items: center;
  padding: 0.8rem;
`;

const Modal = styled.div`
  width: min(900px, 100%);
  max-height: 92vh;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => panelColor(theme)};
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
  display: grid;
  grid-template-rows: auto auto 1fr auto;
`;

const Header = styled.div`
  padding: 0.8rem 0.9rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

const Title = styled.div`
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
`;

const CloseBtn = styled.button`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  border-radius: 10px;
  cursor: pointer;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
`;

const Hint = styled.div`
  padding: 0.55rem 0.9rem;
  font-size: 0.85rem;
  opacity: 0.86;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const ScanRow = styled.div`
  padding: 0.7rem 0.9rem;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.55rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const ScanInput = styled.input`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  border-radius: 10px;
  padding: 0.72rem 0.8rem;
  font-weight: 800;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.accent + "22"};
  }
`;

const Main = styled.div`
  overflow: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 680px;

  th,
  td {
    padding: 0.72rem 0.78rem;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    text-align: left;
  }

  th {
    font-weight: 900;
    background: ${({ theme }) => theme.background};
    position: sticky;
    top: 0;
    z-index: 1;
  }
`;

const TinyBtn = styled.button`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  border-radius: 8px;
  min-width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Footer = styled.div`
  border-top: 1px solid ${({ theme }) => theme.border};
  padding: 0.72rem 0.9rem;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;

const Summary = styled.div`
  font-size: 0.87rem;
  opacity: 0.9;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 0.55rem;
`;

const Btn = styled.button`
  border: none;
  border-radius: 10px;
  padding: 0.58rem 0.88rem;
  font-weight: 900;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const GhostBtn = styled(Btn)`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => panelColor(theme)};
  color: ${({ theme }) => theme.text};
`;

const PrimaryBtn = styled(Btn)`
  background: ${({ theme }) => theme.accent};
  color: #000;
`;

const Feedback = styled.div`
  padding: 0.55rem 0.9rem;
  font-size: 0.84rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  color: ${({ $type }) => ($type === "error" ? "#ef4444" : "inherit")};
`;

function normalizeBarcode(code) {
  return String(code || "")
    .replace(/[\r\n\t ]+/g, "")
    .replace(/\s+/g, "")
    .trim()
    .toUpperCase();
}

export default function StockScannerModal({
  open,
  title = "Escaner + stock",
  entityLabel = "item",
  items = [],
  onClose,
  onApply,
}) {
  const inputRef = useRef(null);
  const scanTimerRef = useRef(null);
  const processingRef = useRef(false);
  const lastProcessedRef = useRef({ code: "", ts: 0 });
  const [scanValue, setScanValue] = useState("");
  const [cartRows, setCartRows] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("info");
  const [applying, setApplying] = useState(false);

  const itemsByCode = useMemo(() => {
    const map = new Map();
    for (const it of items || []) {
      const code = normalizeBarcode(it?.codigo_barra);
      if (!code) continue;
      if (!map.has(code)) {
        map.set(code, {
          id: Number(it.id),
          nombre: it.nombre || `${entityLabel} sin nombre`,
          codigo: code,
          cantidad: Number(it.cantidad || 0),
        });
      }
    }
    return map;
  }, [items, entityLabel]);

  const totalUnits = useMemo(
    () => cartRows.reduce((acc, row) => acc + Number(row.addQty || 0), 0),
    [cartRows]
  );

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 40);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setScanValue("");
    setCartRows([]);
    setFeedback("");
    setFeedbackType("info");
    setApplying(false);
    processingRef.current = false;
    lastProcessedRef.current = { code: "", ts: 0 };
    if (scanTimerRef.current) {
      window.clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }
  }, [open]);

  useEffect(
    () => () => {
      if (scanTimerRef.current) {
        window.clearTimeout(scanTimerRef.current);
      }
    },
    []
  );

  function focusInput() {
    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }

  function addScan(rawCode, opts = {}) {
    const source = opts.source || "manual";
    const code = normalizeBarcode(rawCode);
    if (!code) {
      if (source !== "auto") {
        setFeedback("Escanea o escribe un codigo valido.");
        setFeedbackType("error");
      }
      focusInput();
      return false;
    }

    const now = Date.now();
    if (lastProcessedRef.current.code === code && now - lastProcessedRef.current.ts < 350) {
      setScanValue("");
      focusInput();
      return false;
    }

    const item = itemsByCode.get(code);
    if (!item) {
      if (source !== "auto" || code.length >= 4) {
        setFeedback(`Codigo no encontrado: ${code}`);
        setFeedbackType("error");
      }
      setScanValue("");
      focusInput();
      return false;
    }

    lastProcessedRef.current = { code, ts: now };

    setCartRows((prev) => {
      const idx = prev.findIndex((x) => Number(x.id) === Number(item.id));
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], addQty: Number(copy[idx].addQty || 0) + 1 };
        return copy;
      }
      return [...prev, { ...item, addQty: 1 }];
    });

    setFeedback(`${item.nombre} agregado (+1)`);
    setFeedbackType("info");
    setScanValue("");
    focusInput();
    return true;
  }

  function scheduleAutoAdd(nextValue) {
    if (scanTimerRef.current) {
      window.clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }

    const code = normalizeBarcode(nextValue);
    if (!code) return;

    scanTimerRef.current = window.setTimeout(() => {
      if (processingRef.current || applying) return;
      processingRef.current = true;
      try {
        addScan(code, { source: "auto" });
      } finally {
        processingRef.current = false;
      }
    }, 120);
  }

  function onScanInputChange(nextValue) {
    setScanValue(nextValue);
    scheduleAutoAdd(nextValue);
  }

  function addScanNow(rawCode) {
    if (scanTimerRef.current) {
      window.clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    if (processingRef.current || applying) return;

    processingRef.current = true;
    try {
      addScan(rawCode, { source: "manual" });
    } finally {
      processingRef.current = false;
    }
  }

  function removeRow(id) {
    setCartRows((prev) => prev.filter((row) => Number(row.id) !== Number(id)));
    focusInput();
  }

  async function handleApply() {
    if (!totalUnits || applying) return;
    try {
      setApplying(true);
      await onApply(
        cartRows.map((row) => ({
          id: Number(row.id),
          nombre: row.nombre,
          codigo_barra: row.codigo,
          addQty: Number(row.addQty || 0),
          cantidadActual: Number(row.cantidad || 0),
        }))
      );
      onClose();
    } catch (e) {
      setFeedback(e?.message || "No se pudo aplicar el lote.");
      setFeedbackType("error");
      focusInput();
    } finally {
      setApplying(false);
    }
  }

  if (!open) return null;

  return (
    <Overlay>
      <Modal>
        <Header>
          <Title>
            <ScanLine size={16} />
            {title}
          </Title>
          <CloseBtn type="button" onClick={onClose} title="Cerrar">
            <X size={15} />
          </CloseBtn>
        </Header>

        <Hint>
          Escaneo automatico
        </Hint>

        <ScanRow>
          <ScanInput
            ref={inputRef}
            value={scanValue}
            onChange={(e) => onScanInputChange(e.target.value)}
            onBlur={focusInput}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addScanNow(scanValue);
              }
            }}
            placeholder="Escanea codigo de barras (auto)"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <PrimaryBtn type="button" onClick={() => addScanNow(scanValue)} disabled={!scanValue.trim() || applying}>
            <Plus size={15} /> Agregar
          </PrimaryBtn>
        </ScanRow>

        {feedback ? <Feedback $type={feedbackType}>{feedback}</Feedback> : null}

        <Main>
          {cartRows.length === 0 ? (
            <div style={{ padding: "0.9rem", opacity: 0.8 }}>Sin items escaneados.</div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>{entityLabel}</th>
                  <th>Stock actual</th>
                  <th>A sumar</th>
                  <th>Stock final</th>
                  <th>Quitar</th>
                </tr>
              </thead>
              <tbody>
                {cartRows.map((row) => (
                  <tr key={row.id}>
                    <td style={{ fontWeight: 800 }}>{row.codigo}</td>
                    <td>{row.nombre}</td>
                    <td>{row.cantidad}</td>
                    <td><strong>{row.addQty}</strong></td>
                    <td style={{ fontWeight: 900 }}>{Number(row.cantidad || 0) + Number(row.addQty || 0)}</td>
                    <td>
                      <TinyBtn type="button" onClick={() => removeRow(row.id)} disabled={applying}>
                        <Trash2 size={14} />
                      </TinyBtn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Main>

        <Footer>
          <Summary>
            {cartRows.length} {cartRows.length === 1 ? "item" : "items"} - {totalUnits}{" "}
            {totalUnits === 1 ? "unidad" : "unidades"} por agregar
          </Summary>
          <ActionRow>
            <GhostBtn type="button" onClick={onClose} disabled={applying}>
              Cancelar
            </GhostBtn>
            <PrimaryBtn type="button" onClick={handleApply} disabled={applying || totalUnits <= 0}>
              <CheckCircle2 size={15} /> {applying ? "Aplicando..." : "Aplicar al inventario"}
            </PrimaryBtn>
          </ActionRow>
        </Footer>
      </Modal>
    </Overlay>
  );
}

