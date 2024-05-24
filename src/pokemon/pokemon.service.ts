import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {

  private defaultLimit: number

  constructor (
    @InjectModel( Pokemon.name )
    private readonly pokemonMondel: Model<Pokemon>,
    private readonly configService: ConfigService,
  ) {
    this.defaultLimit = configService.get<number>('defaultLimit')
  }

  private handleExceptions( error: any ) {
    if ( error.code === 11000 ) {
      throw new BadRequestException( `Pokemon existe in db ${ JSON.stringify( error.keyValue ) }` )
    }
    console.log(error)
    throw new InternalServerErrorException(`Can't update Pokemon - Check server logs`)
  }

  private trimStrings (obj: any) {
    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            obj[key] = obj[key].trim();
        }
    }
  }

  async create(createPokemonDto: CreatePokemonDto) {

    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    this.trimStrings(createPokemonDto);

    try {

      const pokemon = await this.pokemonMondel.create( createPokemonDto )
  
      return pokemon;

    } catch (error) {
      
      this.handleExceptions( error )

    }
  }

  async findAll( paginationDto: PaginationDto ) {

    const { limit = this.defaultLimit, offset = 0 } = paginationDto

    const allPokemons = await this.pokemonMondel.find()
      .limit( limit )
      .skip( offset )
      .sort({
        no: 1
      })
      .select('-__v')

    if ( allPokemons.length <= 0 ) {
      throw new NotFoundException('Empty DB')
    }

    return allPokemons
  }

  async findOne(term: string) {

    let pokemon: Pokemon

    if ( !isNaN(+term) ) {
      pokemon = await this.pokemonMondel.findOne({ no: term })
    }

    // Verificación por MongoId
    if ( !pokemon && isValidObjectId(term) ) {
      pokemon = await this.pokemonMondel.findById( term )
    }

    // Verificación por Name
    if ( !pokemon ) {
      pokemon = await this.pokemonMondel.findOne({ name: term.toLocaleLowerCase().trim() })
    }

    if ( !pokemon ) throw new NotFoundException(`Pokemon with term: ( id/name/no ), "${term}" not found`)

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne( term )

    if ( updatePokemonDto.name )
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase()

    try {
    
      await pokemon.updateOne( updatePokemonDto )
  
      return { ...pokemon.toJSON(), ...updatePokemonDto };

    } catch (error) {
      this.handleExceptions( error )
    }

  }

  async remove(id: string) {

    // const pokemon = await this.findOne( id )
    // await pokemon.deleteOne()
    // return { id }
    // const result = await this.pokemonMondel.findByIdAndDelete( id )

    const { deletedCount } = await this.pokemonMondel.deleteOne({ _id: id })

    if ( deletedCount === 0 )
      throw new BadRequestException(`Pokemon with id: "${id}" not found`)

    return true
  }

}
