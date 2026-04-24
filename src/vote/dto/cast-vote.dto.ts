import { IsUUID, IsInt, IsOptional, Min } from 'class-validator';

export class CastVoteDto {
  @IsUUID()
  contestantId: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  voteCount?: number; // defaults to 1 in the service
}