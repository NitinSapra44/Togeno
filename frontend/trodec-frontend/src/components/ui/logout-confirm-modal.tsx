import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "./dialog";
import { Button } from "./button";

interface LogoutConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function LogoutConfirmModal({
    isOpen,
    onClose,
    onConfirm,
}: LogoutConfirmModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md border-white/10 bg-[#121212]">
                <DialogHeader>
                    <DialogTitle className="text-white">Confirm Logout</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Are you sure you want to log out?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2 sm:justify-end mt-4">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white hover:bg-white/5"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                    >
                        Logout
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
