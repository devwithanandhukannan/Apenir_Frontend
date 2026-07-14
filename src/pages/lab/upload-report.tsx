import React, { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import SearchIcon from "@mui/icons-material/Search";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { useAppSelector } from "@/core_components/store/hooks";
import { useApi } from "@/core_components/hooks/useApi/useApi";

interface Appointment {
  id: string;
  appointmentNumber: string;
  customerUserId: string;
  customerUser?: {
    id: string;
    name: string;
    phone: string;
  };
  locationAddress: string;
  status: number;
  memberCount: number;
  createdAt: string;
}

interface Member {
  id: string;
  appointmentId: string;
  memberName: string;
  age: number;
  gender: number; // enum values (0 = Male, 1 = Female, etc.)
  relationship: string;
  uniqueNumber: string;
  testName: string | null;
  reportPdfPath?: string;
}

export default function LabUploadReportPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth,
  );
  const { get, post } = useApi();

  // Auth Guard
  useEffect(() => {
    if (isInitialized && (!isAuthenticated || user?.role !== "lab")) {
      router.replace("/lab/login");
    }
  }, [isAuthenticated, user, isInitialized, router]);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // File Upload State
  const [uploadingForMemberId, setUploadingForMemberId] = useState<
    string | null
  >(null);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<
    string | null
  >(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    const response = await get<any>({
      endpoint: "/api/lab/appointments",
      requireAuth: true,
    });
    setLoading(false);

    if (response.success && response.data?.success) {
      setAppointments(response.data.data ?? []);
    } else {
      setError(
        response.data?.message ||
          response.error?.message ||
          "Failed to fetch appointments.",
      );
    }
  }, [get]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const fetchMembers = async (apptId: string) => {
    setLoadingMembers(true);
    const response = await get<any>({
      endpoint: `/api/lab/appointments/${apptId}/members`,
      requireAuth: true,
    });
    setLoadingMembers(false);

    if (response.success && response.data?.success) {
      setMembers(response.data.data ?? []);
    } else {
      setMembers([]);
    }
  };

  const handleSelectAppointment = (appt: Appointment) => {
    setSelectedAppt(appt);
    setUploadSuccessMessage(null);
    fetchMembers(appt.id);
  };

  const handleFileChange = (
    memberId: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFiles((prev) => ({ ...prev, [memberId]: file }));
    }
  };

  const handleUploadReport = async (memberId: string) => {
    const file = selectedFiles[memberId];
    if (!file || !selectedAppt) return;

    setUploadingForMemberId(memberId);
    setUploadSuccessMessage(null);

    const formData = new FormData();
    formData.append("report", file);

    // Call member report upload endpoint
    const response = await post<any, any>({
      endpoint: `/api/lab/appointments/${selectedAppt.id}/members/${memberId}/upload-report`,
      body: formData,
      requireAuth: true,
      headers: {
        // multipart/form-data headers are automatically added by browser when using FormData
      },
    });

    setUploadingForMemberId(null);

    if (response.success && response.data?.success) {
      setUploadSuccessMessage(
        `Report uploaded and dispatched to WhatsApp successfully!`,
      );
      // Clear file selection
      setSelectedFiles((prev) => {
        const copy = { ...prev };
        delete copy[memberId];
        return copy;
      });
      // Refresh member list
      fetchMembers(selectedAppt.id);
      fetchAppointments();
    } else {
      setError(
        response.data?.message ||
          response.error?.message ||
          "Failed to upload report.",
      );
    }
  };

  // Filter appointments by search query (appointment number, client name, or token number)
  const filteredAppointments = appointments.filter((a) => {
    const num = a.appointmentNumber.toLowerCase();
    const client = a.customerUser?.name?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return num.includes(query) || client.includes(query);
  });

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 4:
        return (
          <Chip
            label="Samples Collected"
            color="info"
            size="small"
            sx={{ fontWeight: 700 }}
          />
        );
      case 5:
        return (
          <Chip
            label="Completed"
            color="success"
            size="small"
            sx={{ fontWeight: 700 }}
          />
        );
      case 11:
        return (
          <Chip
            label="Handover to Lab"
            color="warning"
            size="small"
            sx={{ fontWeight: 700 }}
          />
        );
      default:
        return (
          <Chip
            label="Pending/Other"
            color="default"
            size="small"
            sx={{ fontWeight: 700 }}
          />
        );
    }
  };

  const getGenderLabel = (g: number) => {
    return g === 0 ? "Male" : g === 1 ? "Female" : "Other";
  };

  return (
    <>
      <Head>
        <title>Upload Reports – Lab Console</title>
      </Head>

      <Box sx={{ p: { xs: 1, md: 3 } }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 800, mb: 1, letterSpacing: "-0.5px" }}
        >
          Diagnostic Report Management
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Search for collected appointments, view individual test-takers, upload
          PDF reports, and trigger immediate WhatsApp notification dispatch.
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: "10px" }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {uploadSuccessMessage && (
          <Alert
            severity="success"
            sx={{ mb: 3, borderRadius: "10px" }}
            onClose={() => setUploadSuccessMessage(null)}
          >
            {uploadSuccessMessage}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Left panel: Search and select appointment */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "14px",
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>
                  Collected Appointments ({filteredAppointments.length})
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search Appt ID or Client Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <SearchIcon
                          color="action"
                          fontSize="small"
                          sx={{ mr: 1 }}
                        />
                      ),
                    },
                  }}
                  sx={{ mb: 3 }}
                />

                {loading ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 4 }}
                  >
                    <CircularProgress size={30} />
                  </Box>
                ) : filteredAppointments.length === 0 ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "center", py: 4 }}
                  >
                    No matching collected visits found.
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      maxHeight: 500,
                      overflowY: "auto",
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.5,
                    }}
                  >
                    {filteredAppointments.map((appt) => {
                      const isSelected = selectedAppt?.id === appt.id;
                      return (
                        <Card
                          key={appt.id}
                          onClick={() => handleSelectAppointment(appt)}
                          elevation={0}
                          sx={{
                            border: "1px solid",
                            borderColor: isSelected
                              ? "primary.main"
                              : "divider",
                            bgcolor: isSelected
                              ? "rgba(0, 137, 123, 0.04)"
                              : "background.paper",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            "&:hover": {
                              borderColor: "primary.main",
                            },
                          }}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 800,
                                  color: isSelected
                                    ? "primary.main"
                                    : "text.primary",
                                }}
                              >
                                #{appt.appointmentNumber}
                              </Typography>
                              {getStatusLabel(appt.status)}
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {appt.customerUser?.name || "Primary Patient"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block", mt: 0.5 }}
                            >
                              {appt.memberCount} member
                              {appt.memberCount !== 1 ? "s" : ""} ·{" "}
                              {new Date(appt.createdAt).toLocaleDateString()}
                            </Typography>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right panel: Member Details and PDF Upload */}
          <Grid size={{ xs: 12, md: 7 }}>
            {selectedAppt ? (
              <Card
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "14px",
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      mb: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Appointment Member List
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        For Booking: #{selectedAppt.appointmentNumber}
                      </Typography>
                    </Box>
                    <Chip
                      label={`Contact: ${selectedAppt.customerUser?.phone || "None"}`}
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  {loadingMembers ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", py: 6 }}
                    >
                      <CircularProgress size={30} />
                    </Box>
                  ) : members.length === 0 ? (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textAlign: "center", py: 4 }}
                    >
                      No members added to this appointment.
                    </Typography>
                  ) : (
                    <TableContainer
                      component={Paper}
                      elevation={0}
                      sx={{ border: "1px solid", borderColor: "divider" }}
                    >
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: "rgba(0,0,0,0.02)" }}>
                            <TableCell sx={{ fontWeight: 700 }}>
                              Member Info
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>
                              Test Name
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>
                              Token ID
                            </TableCell>
                            <TableCell
                              sx={{ fontWeight: 700, align: "center" }}
                            >
                              Action / Report
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {members.map((member) => {
                            const selectedFile = selectedFiles[member.id];
                            const isUploading =
                              uploadingForMemberId === member.id;
                            const hasReport = !!member.reportPdfPath;

                            return (
                              <TableRow key={member.id} hover>
                                <TableCell>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: 700 }}
                                  >
                                    {member.memberName}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Age: {member.age} ·{" "}
                                    {getGenderLabel(member.gender)} ·{" "}
                                    {member.relationship}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    {member.testName || "Routine Health Test"}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={member.uniqueNumber}
                                    size="small"
                                    sx={{ fontWeight: 700, fontSize: 11 }}
                                  />
                                </TableCell>
                                <TableCell>
                                  {hasReport ? (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <Chip
                                        icon={
                                          <CheckCircleIcon
                                            sx={{ fontSize: "16px !important" }}
                                          />
                                        }
                                        label="Uploaded"
                                        color="success"
                                        size="small"
                                        onClick={() =>
                                          window.open(
                                            member.reportPdfPath,
                                            "_blank",
                                          )
                                        }
                                        sx={{
                                          fontWeight: 700,
                                          cursor: "pointer",
                                        }}
                                      />
                                      <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() =>
                                          window.open(
                                            member.reportPdfPath,
                                            "_blank",
                                          )
                                        }
                                      >
                                        <VisibilityIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  ) : (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 1,
                                      }}
                                    >
                                      {!selectedFile ? (
                                        <Button
                                          variant="outlined"
                                          component="label"
                                          size="small"
                                          startIcon={<CloudUploadIcon />}
                                          sx={{
                                            textTransform: "none",
                                            fontWeight: 700,
                                            py: 0.5,
                                          }}
                                        >
                                          Select PDF
                                          <input
                                            type="file"
                                            hidden
                                            accept="application/pdf"
                                            onChange={(e) =>
                                              handleFileChange(member.id, e)
                                            }
                                          />
                                        </Button>
                                      ) : (
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                          }}
                                        >
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 0.5,
                                            }}
                                          >
                                            <PictureAsPdfIcon
                                              color="error"
                                              fontSize="small"
                                            />
                                            <Typography
                                              variant="caption"
                                              sx={{
                                                fontWeight: 700,
                                                maxWidth: 90,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                              }}
                                            >
                                              {selectedFile.name}
                                            </Typography>
                                          </Box>
                                          <Button
                                            variant="contained"
                                            color="success"
                                            size="small"
                                            onClick={() =>
                                              handleUploadReport(member.id)
                                            }
                                            disabled={isUploading}
                                            sx={{
                                              minWidth: 70,
                                              textTransform: "none",
                                              fontWeight: 700,
                                              py: 0.5,
                                            }}
                                          >
                                            {isUploading ? (
                                              <CircularProgress
                                                size={14}
                                                color="inherit"
                                              />
                                            ) : (
                                              "Upload"
                                            )}
                                          </Button>
                                        </Box>
                                      )}
                                    </Box>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "14px",
                  height: "100%",
                  minHeight: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <CloudUploadIcon
                    sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Please select an appointment from the left panel to upload
                    customer diagnostic reports.
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
