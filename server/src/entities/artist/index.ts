import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm'
import { z } from 'zod'
import { validates } from '@server/utils/validation'
import { Band } from '@server/entities/band'
import { Album } from '@server/entities/album'

@Entity()
export class Artist {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column('text')
  name: string

  @Column('text', { nullable: true, default: null })
  birth: string | null

  @Column('text', { nullable: true, default: null })
  origin: string | null

  @ManyToMany(() => Band, (band) => band.artists, {
    onDelete: 'CASCADE', onUpdate: 'CASCADE'
  })
  bands: Band[]

  @ManyToMany(() => Album, (albums) => albums.artists, {
    onDelete: 'CASCADE', onUpdate: 'CASCADE'
  })
  albums: Album[]
}

export type ArtistBare = Omit<Artist, 'bands' | 'albums'>
export type ArtistSimple = Omit<ArtistBare, 'birth' | 'origin'>
export type ArtistFull = Artist

export const artistSchema = validates<ArtistBare>().with({
  id: z.number().int().positive(),
  name: z.string().min(1).max(200),
  birth: z.string().nullable(),
  origin: z.string().max(200).nullable(),
})

export const artistSearchSchema = artistSchema.pick({ name: true }).extend({
  name: z.string(),
  albumId: z.number().int().positive().optional(),
  bandId: z.number().int().positive().optional(),
})

export const artistInsertSchema = artistSchema.omit({ id: true })
export const artistUpdateSchema = artistSchema.omit({ id: true })

export type ArtistInsert = z.infer<typeof artistInsertSchema>
export type ArtistUpdate = z.infer<typeof artistUpdateSchema>
