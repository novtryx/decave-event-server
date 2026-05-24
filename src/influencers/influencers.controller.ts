import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, UseGuards } from '@nestjs/common';
import { InfluencersService } from './influencers.service';
import { CreateInfluencerDto } from './dto/create-influencer.dto';
import { LoginInfluencerDto } from './dto/login-influencer.dto';
import { InfluencerJwtAuthGuard } from 'src/auth/influencer-jwt.guard';

@Controller('influencers')
export class InfluencersController {
    constructor(private readonly influencersService:InfluencersService){}


     @Post('register')
      @HttpCode(HttpStatus.CREATED)
      register(@Body() dto: CreateInfluencerDto) {
        return this.influencersService.register(dto);
      }

      @Post('login')
      @HttpCode(HttpStatus.OK)
      login(@Body() dto: LoginInfluencerDto) {
        return this.influencersService.login(dto);
      }

      @UseGuards(InfluencerJwtAuthGuard)
      @Get()
      me(
        @Req() req: { user: { id: string; } }
      ){
        return this.influencersService.findOne(req.user.id)
      }

      @UseGuards(InfluencerJwtAuthGuard)
      @Post("add-bank")
      addAccount(
        @Req() req: { user: { id: string; }},
        @Body() dto: {
          bankName: string;
          bankCode: string;
          accountNumber: string;
        }
     
      
      ){
        return this.influencersService.saveBankAccount(req.user.id, dto)
      }

      @UseGuards(InfluencerJwtAuthGuard)
      @Post("request-withdrawal")
      withdraw(
        @Req() req: { user: { id: string; }},
        @Body() dto: {amount: number}
      ){
          return this.influencersService.requestWithdrawal(req.user.id, dto)
      }


    @UseGuards(InfluencerJwtAuthGuard)
    @Get('transactions')
async getTransactionHistory(
 @Req() req: { user: { id: string; }},
  @Query('page') page?: string,
  @Query('limit') limit?: string,
) {
  return this.influencersService.getTransactionHistory(
    req.user.id,
    page ? parseInt(page, 10) : 1,
    limit ? parseInt(limit, 10) : 20,
  );
}
}
