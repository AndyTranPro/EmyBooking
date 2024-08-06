/**
 * Filter modal component - a modal with all the filter options (equipment, room type, capacity etc.)
 */

import React, { useState, useEffect } from 'react';
import {
  Box, Button, Modal, IconButton, Accordion, AccordionSummary, AccordionDetails,
  FormControl, FormGroup, FormControlLabel, Checkbox, TextField, Typography, Divider,
  RadioGroup, Radio, InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface FilterModalProps {
  open: boolean;
  handleClose: () => void;
  handleConfirm: (filters: {
    selectedOptions: string[];
    selectedType: string;
    capacityMin: number;
    capacityMax: number;
    startTime: string;
    endTime: string;
  }) => void;
  options: string[];
  types: string[];
  selectedDate: Date;
  userType: string;
}

const FilterModal: React.FC<FilterModalProps> = ({
  open, handleClose, handleConfirm, options, types, selectedDate, userType
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [capacityMin, setCapacityMin] = useState<number | "">("");
  const [capacityMax, setCapacityMax] = useState<number | "">("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [equipmentExpanded, setEquipmentExpanded] = useState<boolean>(false);
  const [typeExpanded, setTypeExpanded] = useState<boolean>(false);
  const [timeExpanded, setTimeExpanded] = useState<boolean>(false);
  const [modalStyle, setModalStyle] = useState({});
  const [startTimeError, setStartTimeError] = useState(false);
  const [endTimeError, setEndTimeError] = useState(false);
  const [helperTextStart, setHelperTextStart] = useState('');
  const [helperTextEnd, setHelperTextEnd] = useState('');

  // remove hotdesk option in type for CSE staff
  if(userType === "cse_staff") {
    types = types.filter((type) => type !== "hot desk");
  }

  const validateTimes = (start: string, end: string) => {
    const now = new Date();
    // initialise the default start and end time
    let startTime = new Date(selectedDate);
    startTime.setHours(Number(start.split(":")[0]), Number(start.split(":")[1]), 0, 0);
    let endTime = new Date(selectedDate);
    endTime.setHours(Number(end.split(":")[0]), Number(end.split(":")[1]), 0, 0);
    let startTimeError = false;
    let endTimeError = false;
    let helperTextStart = '';
    let helperTextEnd = '';

    if (start || end) {
      if (startTime >= endTime) {
        endTimeError = true;
        helperTextEnd = 'End time must be later than start time!';
      }
      else if (startTime <= now) {
        startTimeError = true;
        helperTextStart = 'Start time must be in the future!';
      }
    }
    setStartTimeError(startTimeError);
    setEndTimeError(endTimeError);
    setHelperTextStart(helperTextStart);
    setHelperTextEnd(helperTextEnd);
  };


  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
    validateTimes(newStartTime, endTime);
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newEndTime = e.target.value;
    setEndTime(newEndTime);
    validateTimes(startTime, newEndTime);
  };



  useEffect(() => {
    const newStyle = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: { xs: '90%', sm: '80%', md: '60%', lg: '20%' },
      maxHeight: '80vh',
      bgcolor: 'background.paper',
      borderRadius: '12px',
      border: 'none',
      boxShadow: 24,
      p: 4,
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    };
    setModalStyle(newStyle);
  }, [equipmentExpanded, typeExpanded]);

  useEffect(() => {
    if (open) {
      const savedFilters = localStorage.getItem('filterConfig');
      if (savedFilters) {
        const {
          selectedOptions,
          selectedType,
          capacityMin,
          capacityMax,
          startTime,
          endTime
        } = JSON.parse(savedFilters);
        setSelectedOptions(selectedOptions);
        setSelectedType(selectedType);
        setCapacityMin(capacityMin);
        setCapacityMax(capacityMax);
        setStartTime(startTime);
        setEndTime(endTime);
      }
    }
  }, [open]);

  const clearFilters = () => {
    setSelectedOptions([]);
    setSelectedType("");
    setCapacityMin("");
    setCapacityMax("");
    setStartTime("");
    setEndTime("");
    setEquipmentExpanded(false);
    setTypeExpanded(false);
    setTimeExpanded(false);
    localStorage.removeItem('filterConfig');
    setStartTimeError(false);
    setEndTimeError(false);
    setHelperTextStart("");
    setHelperTextEnd("");
  };

  const handleToggleOption = (option: string) => {
    const index = selectedOptions.indexOf(option);
    const newSelectedOptions = [...selectedOptions];
    if (index === -1) {
      newSelectedOptions.push(option);
    } else {
      newSelectedOptions.splice(index, 1);
    }
    setSelectedOptions(newSelectedOptions);
  };

  const handleCapacityChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, setter: React.Dispatch<React.SetStateAction<number | "">>) => {
    setter(Number(event.target.value) || "");
  };

  const preventInvalidInput = (event: React.KeyboardEvent) => {
    if (!/[0-9]/.test(event.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'].includes(event.key)) {
      event.preventDefault();
    }
  };

  const saveFilters = () => {
    if (selectedOptions.length === 0 && capacityMin === "" && selectedType === "" && capacityMax === "" && startTime === "" && endTime === "") {
      localStorage.removeItem('filterConfig');
      return;
    }
    const filterConfig = {
      selectedOptions,
      selectedType,
      capacityMin,
      capacityMax,
      startTime,
      endTime
    };
    localStorage.setItem('filterConfig', JSON.stringify(filterConfig));
  };

  return (
    <Modal
      open={open}
      aria-labelledby="filter-modal-title"
      aria-describedby="filter-modal-description"
    >
      <Box sx={modalStyle}>
        <IconButton
          onClick={() => {
            saveFilters();
            handleClose();
          }}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          data-testid='Modal close button'
        >
          <CloseIcon />
        </IconButton>
        <Typography id="filter-modal-title" variant="h6" component="h2" sx={{ mb: 2, ml: 3 }}>
          Apply Filters
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {(userType != "hdr_student" && <Accordion sx={{ mb: 2 }} expanded={equipmentExpanded} onChange={() => setEquipmentExpanded(!equipmentExpanded)}>
          <AccordionSummary data-testid="eq-summary" expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
            <Typography>Equipment</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              {options.map((option) => (
                <FormControlLabel
                  key={option}
                  control={<Checkbox checked={selectedOptions.includes(option)} onChange={() => handleToggleOption(option)} />}
                  label={option}
                />
              ))}
            </FormGroup>
          </AccordionDetails>
        </Accordion>)}
        {(userType !== "hdr_student" && userType !== "non_cse_staff") && (<Accordion sx={{ mb: 2 }} expanded={typeExpanded} onChange={() => setTypeExpanded(!typeExpanded)}>
          <AccordionSummary data-testid="types" expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
            <Typography>Type</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <RadioGroup
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}>
              {types.map((type) => (
                <FormControlLabel
                  key={type}
                  value={type}
                  control={<Radio />}
                  label={type}
                />
              ))}
              <FormControlLabel
                value=""
                control={<Radio />}
                label="any"
              />
            </RadioGroup>
          </AccordionDetails>
        </Accordion>)}
        <Accordion sx={{ mb: 2 }} expanded={timeExpanded || userType === "hdr_student"} onChange={() => setTimeExpanded(!timeExpanded)}>
          <AccordionSummary data-testid="timespan" expandIcon={<ExpandMoreIcon />} aria-controls="panel4a-content" id="panel4a-header">
            <Typography>Available Time Span</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl fullWidth>
              <TextField
                label="Start Time"
                type="time"
                InputLabelProps={{
                  shrink: true,
                }}
                value={startTime}
                onChange={handleStartTimeChange}
                error={startTimeError}
                helperText={startTimeError ? helperTextStart : ''}
                sx={{ mb: 2 }}
              />
              <TextField
                label="End Time"
                type="time"
                InputLabelProps={{
                  shrink: true,
                }}
                value={endTime}
                onChange={handleEndTimeChange}
                error={endTimeError}
                helperText={endTimeError ? helperTextEnd : ''}
                sx={{ mb: 2 }}
              />
            </FormControl>
          </AccordionDetails>
        </Accordion>
        <Divider sx={{ my: 2 }} />
        {(userType != "hdr_student" && <FormControl fullWidth>
          <TextField
            label="Capacity Min"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            value={capacityMin}
            onChange={(e) => handleCapacityChange(e, setCapacityMin)}
            sx={{ mb: 2 }}
            inputProps={{ min: 0 }}
            onKeyDown={preventInvalidInput}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton data-testid="clear-capacity-min" onClick={() => setCapacityMin('')} edge="end">
                    <CloseIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <TextField
            label="Capacity Max"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            value={capacityMax}
            onChange={(e) => handleCapacityChange(e, setCapacityMax)}
            sx={{ mb: 2 }}
            inputProps={{ min: 0 }}
            onKeyDown={preventInvalidInput}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton data-testid="clear-capacity-max" onClick={() => setCapacityMax('')} edge="end">
                    <CloseIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </FormControl>)}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={clearFilters}
            sx={{ mt: 2 }}
          >
            Clear Filters
          </Button>
          <Button
            variant="contained"
            disabled={startTimeError || endTimeError}
            onClick={() => {
              handleConfirm({
                selectedOptions,
                selectedType,
                capacityMin: Number(capacityMin),
                capacityMax: Number(capacityMax),
                startTime,
                endTime
              });
              saveFilters();
              handleClose();
            }}
            sx={{ mt: 2 }}
          >
            Confirm
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default FilterModal;