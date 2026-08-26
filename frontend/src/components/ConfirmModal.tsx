import { Modal, Button, Spinner } from "react-bootstrap";

interface ConfirmModalProps {
    show: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "primary" | "success" | "warning";
    isLoading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({
    show,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    variant = "danger",
    isLoading = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    return (
        <Modal show={show} onHide={onCancel} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="mb-0">{message}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
                    {cancelText}
                </Button>
                <Button variant={variant} onClick={onConfirm} disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Processando...
                        </>
                    ) : (
                        confirmText
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
