import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { SaveBankAccountDto } from './dto/save-bank-account.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';  // 

@Controller('payouts')
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  // ─── Summary ────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('summary')
  getSummary(@Req() req: any) {
    return this.payoutsService.getSummary(req.user.id);
  }

  // ─── Withdrawals ─────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('withdrawals')
  getWithdrawals(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.payoutsService.getWithdrawals(req.user.id, Number(page), Number(limit));
  }

  @UseGuards(JwtAuthGuard)
  @Post('withdraw')
  requestWithdrawal(@Req() req: any, @Body() dto: CreateWithdrawalDto) {
    return this.payoutsService.requestWithdrawal(
      req.user.id,
      { name: req.user.name, email: req.user.email },
      dto,
    );
  }

  // ─── Magic link (no auth — admin clicks from email) ──────────────────

  @Get('verify-withdrawal/:token')
  verifyWithdrawal(@Param('token') token: string) {
    return this.payoutsService.verifyWithdrawal(token);
  }

  // ─── Bank Account ─────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('bank-account')
  getBankAccount(@Req() req: any) {
    return this.payoutsService.getBankAccount(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('bank-account')
  saveBankAccount(@Req() req: any, @Body() dto: SaveBankAccountDto) {
    return this.payoutsService.saveBankAccount(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('bank-account')
  deleteBankAccount(@Req() req: any) {
    return this.payoutsService.deleteBankAccount(req.user.id);
  }

   @UseGuards(JwtAuthGuard)
@Get('banks')
getBanks() {
  return this.payoutsService.getBanks();
}

// Resolve account
  @UseGuards(JwtAuthGuard)
@Get('resolve-account')
resolveAccount(
  @Query('accountNumber') accountNumber: string,
  @Query('bankCode') bankCode: string,  
) {
  return this.payoutsService.resolveAccountPublic(accountNumber, bankCode);
}
}