import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto/update-coffee.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';

@Controller('coffees')
export class CoffeesController {
  constructor(private readonly coffeesService: CoffeesService) {}

  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    //const { limit, offset } = paginationQuery;
    return this.coffeesService.findAll(paginationQuery);
    //return `This action returns all coffees. Limit: ${limit}, offset: ${offset}`;
    //http://localhost:3000/coffees?limit=20&offset=10
  }
  // findAll(@Res() response) {
  //   response.status(200).send('This action returns all coffees');
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log(typeof id);
    return this.coffeesService.findOne(id);
    //return `here we return ${id} coffee`;
  }

  @Post()
  create(@Body() createCoffeeDto: CreateCoffeeDto) {
    console.log(createCoffeeDto instanceof CreateCoffeeDto); //true //due to "transform: true" within main.ts
    return this.coffeesService.create(createCoffeeDto);
  }
  //  @Post()
  // @HttpCode(HttpStatus.GONE)
  // create(@Body() body) {
  //   return body;
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCoffeeDto: UpdateCoffeeDto) {
    return this.coffeesService.update(id, updateCoffeeDto);
    //return `This action updates ${id} coffee`;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coffeesService.remove(id);
    //return `This action removes ${id} coffee`;
  }
}
