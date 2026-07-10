import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import SendIcon from "@mui/icons-material/Send";
import toast from "react-hot-toast";
import ResponsiveGrid from "@/shared_features/responsive_grid";
import { useLabConsole } from "./useLabConsole";

export const LabConsole: React.FC = () => {
  const {
    filters,
    setFilters,
    loading,
    paginatedData,
    pagination,
    columns,
    filterMenuConfig,
    handleRowAction,
    isInviteDialogOpen,
    setIsInviteDialogOpen,
    inviteEmail,
    setInviteEmail,
    inviteLabName,
    setInviteLabName,
    isInviting,
    handleInviteSubmit,
  } = useLabConsole();

  const onSubmitInvite = async () => {
    const res = await handleInviteSubmit();
    if (res.success) {
      toast.success(res.message || "Invitation sent successfully!");
    } else {
      toast.error(res.message || "Failed to send invitation.");
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, mb: 0.5, letterSpacing: "-0.5px" }}
          >
            Lab Console
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor branches, locations, active staff members, and diagnostic
            operations.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={() => setIsInviteDialogOpen(true)}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "8px",
            px: 2.5,
            py: 1,
          }}
        >
          Invite Lab
        </Button>
      </Box>

      {/* Reusable Grid component */}
      <ResponsiveGrid
        data={paginatedData}
        loading={loading}
        filters={filters}
        setFilters={setFilters}
        filterMenuConfig={filterMenuConfig}
        columns={columns}
        searchPlaceholder="Search Lab ID, Name, or City..."
        pagination={pagination}
        onRowActionClick={handleRowAction}
        rowActionLabel="Manage"
      />

      {/* Invite Lab Dialog */}
      <Dialog
        open={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              p: 1,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Invite Lab Partner
        </DialogTitle>
        <DialogContent
          sx={{ py: 1.5, display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          <Typography variant="body2" color="text.secondary">
            Send an onboarding invitation link to a diagnostic laboratory
            partner.
          </Typography>
          <TextField
            label="Lab Name"
            placeholder="Enter laboratory name"
            fullWidth
            required
            value={inviteLabName}
            onChange={(e) => setInviteLabName(e.target.value)}
            slotProps={{
              inputLabel: { shrink: true },
            }}
          />
          <TextField
            label="Email Address"
            placeholder="enter@email.com"
            type="email"
            fullWidth
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            slotProps={{
              inputLabel: { shrink: true },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button
            onClick={() => setIsInviteDialogOpen(false)}
            variant="outlined"
            color="inherit"
            disabled={isInviting}
            sx={{ fontWeight: 700, textTransform: "none", borderRadius: "8px" }}
          >
            Close
          </Button>
          <Button
            onClick={onSubmitInvite}
            variant="contained"
            disabled={isInviting || !inviteEmail || !inviteLabName}
            sx={{
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "8px",
              px: 3,
            }}
          >
            {isInviting ? "Inviting..." : "Invite"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LabConsole;
