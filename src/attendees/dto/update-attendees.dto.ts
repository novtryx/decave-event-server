import { PartialType } from "@nestjs/mapped-types";
import { CreateAttendeeDto } from "./create-attendees.dto";

export class UpdateAttendeesDto extends PartialType(CreateAttendeeDto){}